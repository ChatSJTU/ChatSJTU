from chat.serializers import UserPreferenceSerializer, SessionSerializer, MessageSerializer, ChatErrorSerializer
from chat.models import Session, Message, UserAccount, UserPreference
from chat.core import STUDENT_LIMIT, handle_message, summary_title, senword_detector_strict
from chat.core.errors import ChatError
from oauth.models import UserProfile

from rest_framework.decorators import authentication_classes, permission_classes
from rest_framework.authentication import SessionAuthentication
from rest_framework.permissions import IsAuthenticated
from django.forms.utils import ValidationError
from asgiref.sync import sync_to_async
from adrf.decorators import api_view
from django.http import JsonResponse
from django.utils import timezone
from django.db.models import F

import logging

# def get_or_create_user(device_id):
#     # 根据设备标识查找或创建对应的用户
#     user, created = User.objects.get_or_create(username=device_id)
#     return user

# 获取会话列表或创建会话

logger = logging.getLogger(__name__)


@api_view(['GET', 'POST'])
@authentication_classes([SessionAuthentication])
@permission_classes([IsAuthenticated])
async def sessions(request):
    if request.method == 'GET':
        user = request.user  # 从request.user获取当前用户
        # sessions = await Session.objects.filter(user=user)  # 基于当前用户过滤会话
        sessions = [session async for session in Session.objects.filter(user=user)]
        data = await sync_to_async(lambda sessions: SessionSerializer(sessions, many=True).data)(sessions)
        return JsonResponse(data, safe=False)
    elif request.method == 'POST':
        # 创建新会话，并关联到当前用户
        user = request.user
        session = await Session.objects.acreate(name='新会话', user=user)
        data = await sync_to_async(lambda session: SessionSerializer(session).data)(session)
        return JsonResponse(data)
    else:
        return JsonResponse({"error": "请求方法未支持"}, status=404)

# 删除会话


@api_view(['DELETE'])
@authentication_classes([SessionAuthentication])
@permission_classes([IsAuthenticated])
async def delete_session(request, session_id):
    try:
        await Session.objects.filter(id=session_id, user=request.user).adelete()
        return JsonResponse({'message': '成功删除会话'})
    except Session.DoesNotExist:
        return JsonResponse({'error': '会话不存在'}, status=404)

# 删除所有会话


@api_view(['DELETE'])
@authentication_classes([SessionAuthentication])
@permission_classes([IsAuthenticated])
async def delete_all_sessions(request):
    try:
        await Session.objects.filter(user=request.user).adelete()
        return JsonResponse({'message': 'All sessions deleted successfully'})
    except Session.DoesNotExist:
        return JsonResponse({'error': '会话不存在'}, status=404)

# 修改会话名称


@api_view(['POST'])
@authentication_classes([SessionAuthentication])
@permission_classes([IsAuthenticated])
async def rename_session(request, session_id):
    try:
        new_name = request.data.get('new_name').strip()
        if len(new_name) == 0:
            return JsonResponse({'error': '会话名不得为空'}, status=400)
        elif len(new_name) > 30:
            return JsonResponse({'error': '会话名过长'}, status=400)
        if senword_detector_strict.find(new_name):
            return JsonResponse({'error': '存在敏感词'}, status=400)
        session = await Session.objects.aget(id=session_id, user=request.user)
        session.name = new_name
        session.is_renamed = True
        await session.asave()
        return JsonResponse({'message': 'Session renamed successfully'})
    except Session.DoesNotExist:
        return JsonResponse({'error': '会话不存在'}, status=404)

# 获取会话中的消息内容


@api_view(['GET'])
@authentication_classes([SessionAuthentication])
@permission_classes([IsAuthenticated])
async def session_messages(request, session_id):
    try:

        filters = {"session__id": session_id, "session__user": request.user}

        messages = [message async for message in Message.objects.filter(**filters)]

        serializer = MessageSerializer(messages, many=True)
        return JsonResponse(serializer.data, safe=False)
    except UserPreference.DoesNotExist:
        return JsonResponse({'error': '用户不存在'}, status=404)
    except Session.DoesNotExist:
        return JsonResponse({'error': '会话不存在'}, status=404)

# 发送消息


@api_view(['POST'])
@authentication_classes([SessionAuthentication])
@permission_classes([IsAuthenticated])
async def send_message(request, session_id):

    user_message: str = request.data.get('message')
    selected_model: str = request.data.get('model')

    permission, isStu = await check_usage(request.user)

    # if not permission and user_message[0] != '/':  # 若字符串以/开头，还是进入下方流程判断是否为快捷命令
    #     time.sleep(1)   # 避免处理太快前端显示闪烁
    #     return errorresp

    try:

        session = await Session.objects.aget(id=session_id, user=request.user)

        sendTimestamp = timezone.now()

        # 处理信息
        ai_message_obj = await handle_message(
            user=request.user,
            msg=user_message,
            selected_model=selected_model,
            session=session,
            permission=permission
        )

        # 将发送消息加入数据库
        user_message_obj = await Message.objects.acreate(
            sender=1,
            session=session,
            content=user_message,
            flag_qcmd=ai_message_obj.flag_qcmd,
            timestamp=sendTimestamp,
        )

        # 将返回消息加入数据库
        ai_message_obj.session = session
        await ai_message_obj.asave()

        # 查看session是否进行过改名（再次filter防止同步问题）

        session_rename = ''

        if not ai_message_obj.flag_qcmd:
            if not await Session.objects.filter(id=session_id).values_list('is_renamed', flat=True).afirst():
                rename_flag, rename_resp = await summary_title(msg=user_message)
                if rename_flag:
                    session.name = rename_resp
                    session_rename = rename_resp
                    session.is_renamed = True
                    await session.asave()

        # 增加次数，返回服务端生成的回复消息
        if isStu and not ai_message_obj.flag_qcmd:
            await increase_usage(user=request.user)

        return JsonResponse({
            'message': ai_message_obj.content,
            'flag_qcmd': ai_message_obj.flag_qcmd,
            'use_model': ai_message_obj.use_model,
            'send_timestamp': user_message_obj.timestamp.isoformat(),
            'response_timestamp': ai_message_obj.timestamp.isoformat(),
            'session_rename': session_rename,
        })

    except ChatError as e:
        serializer = ChatErrorSerializer(e)
        return JsonResponse(serializer.data, status=e.status)

    except Session.DoesNotExist:
        return JsonResponse({'error': '会话不存在'}, status=404)

# 检查使用次数
# 返回: permission（是否达到上限）、isStu（是否为学生)


async def check_usage(user) -> tuple[bool, bool]:

    try:
        profile = await UserProfile.objects.aget(user=user)
        if profile.user_type != 'student':
            return True, False

    except UserProfile.DoesNotExist:
        raise ChatError('用户信息错误', status=404)

    try:

        account = await UserAccount.objects.aget(user=user)
        today = timezone.localtime(timezone.now()).date()

        if account.last_used != today:
            account.usage_count = 0
            account.last_used = today
            await account.asave()
            return True, True

        if account.usage_count >= STUDENT_LIMIT:
            return False, True
        else:
            return True, True

    except UserAccount.DoesNotExist:
        raise ChatError('用户信息错误', status=404)

    except Exception as e:
        raise ChatError(e.__str__(), status=500)

# 更新使用次数


async def increase_usage(user):
    try:
        accounts = UserAccount.objects.filter(user=user)
        await sync_to_async(accounts.update)(usage_count=F('usage_count') + 1)
    except UserAccount.DoesNotExist:
        raise ChatError('用户信息错误', status=404)

# 检查并更新使用次数
# def check_and_update_usage(user):
#     try:
#         profile = UserProfile.objects.get(user=user)
#         if profile.user_type != 'student':
#             return True, None
#     except UserProfile.DoesNotExist:
#         return False, JsonResponse({'error': '用户信息错误'}, status=404)

#     try:
#         account= UserAccount.objects.get(user=user)
#         today = timezone.localtime(timezone.now()).date()
#         if account.last_used != today:
#             account.usage_count = 1
#             account.last_used = today
#         else:
#             account.usage_count += 1

#         if account.usage_count > STUDENT_LIMIT:
#             return False, JsonResponse({'error': '您已到达今日使用上限'}, status=429)
#         else:
#             account.save()
#             return True, None
#     except UserAccount.DoesNotExist:
#         return False, JsonResponse({'error': '用户信息错误'}, status=404)

# 偏好设置


@api_view(['GET', 'PATCH'])
@authentication_classes([SessionAuthentication])
@permission_classes([IsAuthenticated])
async def user_preference(request):

    preference = await UserPreference.objects.aget(user=request.user)

    if request.method == 'GET':

        serializer = UserPreferenceSerializer(preference)
        return JsonResponse(serializer.data)

    elif request.method == 'PATCH':

        field = request.data.get('field')
        value = request.data.get('value')

        if field is None or value is None:
            return JsonResponse({'error': '缺少参数'}, status=400)

        if field not in preference.__dict__.keys():
            return JsonResponse({'error': '修改域不存在'}, status=400)

        setattr(preference, field, value)

        try:
            await sync_to_async(preference.full_clean)()
        except ValidationError:
            return JsonResponse({'error': '修改域不合法'}, status=400)

        await preference.asave()
        serializer = UserPreferenceSerializer(preference)
        return JsonResponse(serializer.data)
