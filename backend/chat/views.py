from django.utils.http import base36_to_int, int_to_base36
from transformers import AutoTokenizer
from chat.renderers import ServerSentEventRenderer
from chat.serializers import (
    UserPreferenceSerializer,
    UserGroupSerializer,
    SessionSerializer,
    MessageSerializer,
    ChatErrorSerializer,
)
from chat.models import (
    Session,
    Message,
    SessionShared,
    UserAccount,
    UserPreference,
    UserGroup,
    TokenUsage,
    Blob,
)
from chat.core import (
    STUDENT_LIMIT,
    handle_message,
    summary_title,
    senword_detector_strict,
)
from .core.base import GPTPermission, GPTContext, GPTRequest
from .core.errors import ChatError
from .core.plugin import plugins_list_serialized
from .core.configs import CHAT_MODELS, ModelCap
from oauth.models import UserProfile
from rest_framework.decorators import (
    authentication_classes,
    permission_classes,
    renderer_classes,
)
from rest_framework.authentication import SessionAuthentication
from rest_framework.permissions import AllowAny, IsAuthenticated
from django.contrib.admin.options import transaction
from django.forms.utils import ValidationError
from django.http import HttpResponse, JsonResponse, StreamingHttpResponse
from django.utils import timezone
from django.db.models import F
from asgiref.sync import sync_to_async
from adrf.decorators import api_view

from dataclasses import asdict
from typing import Union
import logging
import dateutil.parser
import django.db
import base64
import json
import mmh3

# def get_or_create_user(device_id):
#     # 根据设备标识查找或创建对应的用户
#     user, created = User.objects.get_or_create(username=device_id)
#     return user

# 获取会话列表或创建会话

logger = logging.getLogger(__name__)


@api_view(["GET", "POST"])
@authentication_classes([SessionAuthentication])
@permission_classes([IsAuthenticated])
async def sessions(request):
    if request.method == "GET":
        user = request.user  # 从request.user获取当前用户
        sessions = await sync_to_async(
            lambda: Session.objects.filter(user=user, deleted_time__isnull=True).all()
        )()
        data = await sync_to_async(
            lambda sessions: SessionSerializer(sessions, many=True).data
        )(sessions)
        return JsonResponse(data, safe=False)
    elif request.method == "POST":
        # 创建新会话，并关联到当前用户
        user = request.user
        session = await Session.objects.acreate(name="新会话", user=user)
        data = await sync_to_async(lambda session: SessionSerializer(session).data)(
            session
        )
        return JsonResponse(data)
    else:
        return JsonResponse({"error": "请求方法未支持"}, status=404)


# 删除会话


@api_view(["DELETE"])
@authentication_classes([SessionAuthentication])
@permission_classes([IsAuthenticated])
async def delete_session(request, session_id):
    try:
        session = Session.objects.filter(
            id=session_id, user=request.user, deleted_time__isnull=True
        )
        await sync_to_async(session.update)(deleted_time=timezone.now())
        return JsonResponse({"message": "成功删除会话"})
    except Session.DoesNotExist:
        return JsonResponse({"error": "会话不存在"}, status=404)


# 删除所有会话


@api_view(["DELETE"])
@authentication_classes([SessionAuthentication])
@permission_classes([IsAuthenticated])
async def delete_all_sessions(request):
    try:
        sessions = Session.objects.filter(user=request.user, deleted_time__isnull=True)
        await sync_to_async(sessions.update)(deleted_time=timezone.now())
        return JsonResponse({"message": "All sessions deleted successfully"})
    except Session.DoesNotExist:
        return JsonResponse({"error": "会话不存在"}, status=404)


# 修改会话名称


@api_view(["POST"])
@authentication_classes([SessionAuthentication])
@permission_classes([IsAuthenticated])
async def rename_session(request, session_id):
    try:
        new_name = request.data.get("new_name").strip()
        if len(new_name) == 0:
            return JsonResponse({"error": "会话名不得为空"}, status=400)
        elif len(new_name) > 30:
            return JsonResponse({"error": "会话名过长"}, status=400)
        if senword_detector_strict.find(new_name):
            return JsonResponse({"error": "存在敏感词"}, status=400)
        session = await Session.objects.aget(
            id=session_id, user=request.user, deleted_time__isnull=True
        )
        session.name = new_name
        session.is_renamed = True
        await session.asave()
        return JsonResponse({"message": "Session renamed successfully"})
    except Session.DoesNotExist:
        return JsonResponse({"error": "会话不存在"}, status=404)


# 获取会话中的消息内容


@api_view(["GET"])
@authentication_classes([SessionAuthentication])
@permission_classes([IsAuthenticated])
async def session_messages(request, session_id):
    try:
        filters = {
            "session__id": session_id,
            "session__user": request.user,
            "session__deleted_time__isnull": True,
        }

        messages = await sync_to_async(
            lambda: Message.objects.filter(**filters).order_by("timestamp").all()
        )()

        data = await sync_to_async(
            lambda messages: MessageSerializer(messages, many=True).data
        )(messages)
        return JsonResponse(data, safe=False)
    except UserPreference.DoesNotExist:
        return JsonResponse({"error": "用户不存在"}, status=404)
    except Session.DoesNotExist:
        return JsonResponse({"error": "会话不存在"}, status=404)


# 发送消息


@transaction.atomic()
def __get_last_messages(session):
    last_user_message_obj = (
        Message.objects.filter(session=session, sender=1, regenerated=False)
        .order_by("-timestamp")
        .exclude(content="continue")
        .first()
    )
    last_ai_message_obj = (
        Message.objects.filter(session=session, sender=0, generation__gt=0)
        .order_by("-timestamp")
        .first()
    )

    return last_user_message_obj, last_ai_message_obj


async def __build_gpt_request(
    request,
    last_user_message_obj: Message,
    last_ai_message_obj: Message,
) -> GPTRequest:
    try:
        preference = await UserPreference.objects.aget(user=request.user)
    except UserPreference.DoesNotExist:
        raise ChatError("用户信息错误", status=404)

    tokenizer = AutoTokenizer.from_pretrained("bert-base-chinese")
    context = GPTContext()
    msg: str = base64.b64decode(request.data.get("message")).decode()
    model_engine: str = request.data.get("model")
    images = request.data.get("image_urls", []) if model_engine == "OpenAI GPT4" else []
    plugins = request.data.get("plugins")
    plugins: list[str] = plugins if plugins is not None else []

    group = await UserGroup.objects.aget(name=request.user.username)
    usage, created = await sync_to_async(
        lambda group: TokenUsage.objects.get_or_create(
            group=group, datetime=timezone.now().today(), model=model_engine
        )
    )(group)

    cont: bool = msg == "continue"
    regen: bool = msg == "%regenerate%"
    permission = await check_usage(request.user)

    if regen:
        try:
            context.deadline = last_user_message_obj.timestamp
            msg = last_user_message_obj.content
            images = await sync_to_async(
                lambda msg: list(
                    map(
                        lambda blob: blob.location,
                        msg.blob_set.order_by("-timestamp").all(),
                    )
                )
            )(last_user_message_obj)
            context.generation = last_ai_message_obj.generation + 1
        except AttributeError:
            raise ChatError("缺少上一条消息，无法重复生成。", status=404)

    elif cont:
        try:
            context.generation = 0
            context.deadline = timezone.now()
            if not last_ai_message_obj.interrupted:
                raise ChatError("上一条信息并非中断，无法继续", status=400)
        except AttributeError:
            raise ChatError("缺少上一条信息，无法继续", status=404)

    else:
        context.generation = 1
        context.deadline = timezone.now()

    context.request_msg = msg
    context.request_time = timezone.now()
    context.regen = regen
    context.cont = cont
    context.image_urls = images
    context.prompt_tokens = len(tokenizer.tokenize(msg))

    gpt_request = GPTRequest(
        user=request.user,
        token_usage=usage,
        model_engine=model_engine,
        permission=permission,
        context=context,
        preference=preference,
        plugins=plugins,
    )

    return gpt_request


@transaction.atomic()
def __save_new_request_rounds(
    session: Session,
    gpt_request: GPTRequest,
    gpt_response: Message,
) -> tuple[Message, Message]:
    context = gpt_request.context
    ai_message_obj = gpt_response

    if context.regen:
        for last_ai_message_obj in Message.objects.filter(
            session=session,
            sender=0,
            regenerated=False,
            timestamp__gt=context.deadline,
        ):
            last_ai_message_obj.regenerated = True
            last_ai_message_obj.save()

    # 将发送消息加入数据库
    user_message_obj = Message.objects.create(
        sender=1,
        session=session,
        content=context.request_msg,
        timestamp=context.request_time,
        generation=context.generation,
        regenerated=context.regen,
        interrupted=context.cont,
        has_blob=len(context.image_urls) != 0,
        flag_qcmd=ai_message_obj.flag_qcmd,
    )

    ai_message_obj.session = session
    ai_message_obj.generation = context.generation
    ai_message_obj.prompt_tokens = context.prompt_tokens
    # 将返回消息加入数据库
    ai_message_obj.save()

    if (
        CHAT_MODELS[gpt_request.model_engine].image_support
        and len(context.image_urls) != 0
    ):
        Blob.objects.bulk_create(
            [
                Blob(message=user_message_obj, location=image_url)
                for image_url in context.image_urls
            ]
        )

    token_usage = gpt_request.token_usage
    token_usage.prompt_tokens += ai_message_obj.prompt_tokens
    token_usage.completion_tokens += ai_message_obj.completion_tokens
    token_usage.save(update_fields=["prompt_tokens", "completion_tokens"])

    return user_message_obj, ai_message_obj


async def __post_message(
    session_id: int,
    session: Session,
    preference: UserPreference,
    gpt_request: GPTRequest,
    gpt_response: Message,
) -> str:
    session_rename = ""
    context = gpt_request.context
    permission = gpt_request.permission

    # 查看session是否进行过改名（再次filter防止同步问题）
    if not gpt_response.flag_qcmd:
        if (
            not await Session.objects.filter(id=session_id)
            .values_list("is_renamed", flat=True)
            .afirst()
        ) and preference.auto_generate_title:
            re_success, re_resp = await summary_title(msg=context.request_msg)
            if re_success:
                session.name = re_resp
                session_rename = re_resp
                session.is_renamed = True
                await session.asave()

    if permission.student and not gpt_response.flag_qcmd:
        await increase_usage(user=gpt_request.user)

    # 增加次数，返回服务端生成的回复消息
    return session_rename


@api_view(["POST"])
@authentication_classes([SessionAuthentication])
@permission_classes([IsAuthenticated])
async def send_message(request, session_id):
    try:
        session = await Session.objects.aget(
            id=session_id, user=request.user, deleted_time__isnull=True
        )

    except Session.DoesNotExist:
        return JsonResponse({"error": "会话不存在"}, status=404)

    try:
        preference = await UserPreference.objects.aget(user=request.user)
    except UserPreference.DoesNotExist:
        raise ChatError("用户信息错误", status=404)

    last_user_message_obj, last_ai_message_obj = await sync_to_async(
        __get_last_messages
    )(session)

    gpt_request = await __build_gpt_request(
        request, last_user_message_obj, last_ai_message_obj
    )

    async def response_stream(session, reqeust):
        async for gpt_response in await handle_message(
            session=session, request=gpt_request
        ):
            print(gpt_response)
            if isinstance(gpt_response, Message):
                try:
                    user_message_obj, ai_message_obj = await sync_to_async(
                        __save_new_request_rounds
                    )(session, gpt_request, gpt_response)

                    session_rename = await __post_message(
                        session_id, session, preference, gpt_request, gpt_response
                    )

                    return JsonResponse(
                        {
                            "message": ai_message_obj.content,
                            "flag_qcmd": ai_message_obj.flag_qcmd,
                            "use_model": ai_message_obj.use_model,
                            "send_timestamp": user_message_obj.timestamp.isoformat(),
                            "response_timestamp": ai_message_obj.timestamp.isoformat(),
                            "session_rename": session_rename,
                            "plugin_group": ai_message_obj.plugin_group,
                            "image_urls": gpt_request.context.image_urls,
                        }
                    )

                except ChatError as e:
                    serializer = ChatErrorSerializer(e)
                    return JsonResponse(serializer.data, status=e.status)

    return await response_stream(session, request)


# 更新使用次数
async def increase_usage(user):
    try:
        accounts = UserAccount.objects.filter(user=user)
        await sync_to_async(accounts.update)(usage_count=F("usage_count") + 1)
    except UserAccount.DoesNotExist:
        raise ChatError("用户信息错误", status=404)


# 检查使用次数
# 返回: GPTPermission(student: 是否为学生, available: 是否有消息余量)


async def check_usage(user) -> GPTPermission:
    try:
        profile = await UserProfile.objects.aget(user=user)
        if profile.user_type != "student":
            return GPTPermission(student=False, available=True)

    except UserProfile.DoesNotExist:
        raise ChatError("用户信息错误", status=404)

    try:
        account = await UserAccount.objects.aget(user=user)
        today = timezone.localtime(timezone.now()).date()

        if account.last_used != today:
            account.usage_count = 0
            account.last_used = today
            await account.asave()
            return GPTPermission(student=True, available=True)

        if account.usage_count >= STUDENT_LIMIT:
            return GPTPermission(student=True, available=False)
        else:
            return GPTPermission(student=True, available=True)

    except UserAccount.DoesNotExist:
        raise ChatError("用户信息错误", status=404)

    except Exception as e:
        raise ChatError(e.__str__(), status=500)


@api_view(["GET", "PATCH"])
@authentication_classes([SessionAuthentication])
@permission_classes([IsAuthenticated])
async def user_preference(request):
    preference = await UserPreference.objects.aget(user=request.user)

    if request.method == "GET":
        serializer = UserPreferenceSerializer(preference)
        return JsonResponse(serializer.data)

    elif request.method == "PATCH":
        field = request.data.get("field")
        value = request.data.get("value")

        if field is None or value is None:
            return JsonResponse({"error": "缺少参数"}, status=400)

        if field not in preference.__dict__.keys():
            return JsonResponse({"error": "修改域不存在"}, status=400)

        setattr(preference, field, value)

        try:
            await sync_to_async(preference.full_clean)()
        except ValidationError:
            return JsonResponse({"error": "修改域不合法"}, status=400)

        await preference.asave()
        serializer = UserPreferenceSerializer(preference)
        return JsonResponse(serializer.data)


@api_view(["GET"])
@authentication_classes([SessionAuthentication])
@permission_classes([IsAuthenticated])
async def list_plugins(request):
    return HttpResponse(
        plugins_list_serialized,
        content_type="application/json",
        status=200,
    )


@api_view(["POST"])
@authentication_classes([SessionAuthentication])
@permission_classes([IsAuthenticated])
async def share_session(request, session_id):
    try:
        session = await Session.objects.aget(
            id=session_id, user=request.user, deleted_time__isnull=True
        )
    except Session.DoesNotExist:
        return JsonResponse({"error": "会话不存在"}, status=404)

    deadline_r = request.data.get("deadline")
    try:
        deadline = dateutil.parser.parse(deadline_r)
    except Exception:
        return JsonResponse({"error": "分享时间格式错误"}, status=400)

    messages = await sync_to_async(
        lambda session: Message.objects.filter(session=session)
        .order_by("timestamp")
        .all()
    )(session)

    messages = await sync_to_async(
        lambda messages: MessageSerializer(messages, many=True).data
    )(messages)

    snapshot = json.dumps(
        {"username": request.user.username, "name": session.name, "messages": messages}
    )

    version = 0
    while True:
        try:
            share_id = mmh3.hash(
                json.dumps(
                    {
                        "session": session_id,
                        "deadline": deadline_r,
                        "version": version,
                    },
                ),
                signed=False,
            )
            await SessionShared.objects.acreate(
                session=session, deadline=deadline, share_id=share_id, snapshot=snapshot
            )
            break
        except django.db.IntegrityError:
            version += 1

    share_id_b36 = int_to_base36(share_id)
    return JsonResponse({"url": f"?share_id={share_id_b36}&autologin=True"})


async def get_shared_session(request) -> Union[SessionShared, JsonResponse]:
    try:
        share_id = 0
        if request.method == "GET":
            share_id = base36_to_int(request.GET["share_id"])
        elif request.method == "POST":
            share_id = base36_to_int(request.data.get("share_id"))
    except ValueError:
        return JsonResponse({"error": "分享链接不合法"}, status=400)
    except KeyError:
        return JsonResponse({"error": "缺少分享ID"}, status=400)
    try:
        shared = await SessionShared.objects.aget(
            share_id=share_id, deadline__gt=timezone.now()
        )
        return shared
    except SessionShared.DoesNotExist:
        return JsonResponse({"error": "分享链接不存在或已经过期"}, status=404)


@api_view(["GET"])
@authentication_classes([SessionAuthentication])
@permission_classes([IsAuthenticated])
async def view_shared_session(request):
    shared = await get_shared_session(request)
    try:
        return HttpResponse(content=shared.snapshot, content_type="application/json")
    except AttributeError:
        return shared


@api_view(["POST"])
@authentication_classes([SessionAuthentication])
@permission_classes([IsAuthenticated])
async def save_shared_session(request):
    shared = await get_shared_session(request)

    try:
        snapshot = json.loads(shared.snapshot)
    except AttributeError:
        return shared

    @transaction.atomic()
    def create_fork(snapshot: dict):
        def strip(message: dict):
            message.pop("time")
            return message

        session = Session.objects.create(
            user=request.user,
            name="{0} (forked)".format(snapshot["name"]),
        )

        for msg in snapshot["messages"]:
            image_urls = msg.pop("image_urls")
            has_blob = len(image_urls) != 0
            message = Message.objects.create(
                session=session, **strip(msg), has_blob=has_blob
            )
            if has_blob:
                Blob.objects.bulk_create(
                    [Blob(message=message, location=url) for url in image_urls]
                )
        return session

    session = await sync_to_async(create_fork)(snapshot)
    data = await sync_to_async(lambda session: SessionSerializer(session).data)(session)
    return JsonResponse(data, safe=False)


@api_view(["GET"])
@authentication_classes([SessionAuthentication])
@permission_classes([IsAuthenticated])
async def list_models(request):
    return JsonResponse(
        {
            name: asdict(cap, dict_factory=ModelCap.dict_factory)
            for name, cap in CHAT_MODELS.items()
        },
        status=200,
    )


@api_view(["GET"])
@authentication_classes([SessionAuthentication])
@permission_classes([AllowAny])
async def sse_message_stream(request):

    async def event_stream():
        yield "id: 1\n"
        yield "event: message\n"
        yield "data: message data\n\n"
        return

    response = StreamingHttpResponse(event_stream(), content_type="text/event-stream")
    response["X-Accel-Buffering"] = "no"  # Disable buffering in nginx
    response["Cache-Control"] = "no-cache"  # Ensure clients don't cache the data
    return response


@api_view(["POST"])
@authentication_classes([SessionAuthentication])
@permission_classes([AllowAny])
async def group(request):
    name: str = request.get("name")
    account = await UserAccount.objects.aget(user=request.user)
    group = await UserGroup.objects.aget(useraccount=account, name=name)
    data = await sync_to_async(lambda group: UserGroupSerializer(group).data)(group)
    return JsonResponse(data, safe=False)
