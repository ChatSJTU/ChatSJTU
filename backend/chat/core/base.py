from ..models import (
    UserPreference,
    Session,
    SessionContext,
    Message,
    UserAccount,
    UserGroup,
    TokenUsage
)
from .errors import ChatError
from .utils import senword_detector, senword_detector_strict
from .gpt import GPTConnectionFactory
from .configs import (
    OPENAI_MOCK,
    SYSTEM_ROLE,
    SYSTEM_ROLE_STRICT,
    SYSTEM_ROLE_FRIENDLY_TL,
    CHAT_MODELS,
    ModelCap,
)
from .plugin import check_and_exec_qcmds, PluginResponse, fc_get_specs
from .plugins.fc import FCSpec

from django.contrib.auth.models import User
from django.utils.timezone import datetime
from dataclasses import dataclass
from typing import Union, Optional

import logging
import functools
import time

logger = logging.getLogger(__name__)


async def check_and_handle_qcmds(msg: str) -> Union[Message, None]:
    """检查并处理是否为快捷命令

    Args:
        msg: 用户输入的消息
    Returns:
        message: Message对象
    Error:
        ChatError: 若出错则抛出
    """
    resp: PluginResponse = check_and_exec_qcmds(msg)

    if resp.triggered:
        if resp.success:
            return Message(content=resp.content, flag_qcmd=True, sender=0)
        else:
            raise ChatError(resp.content)

    return None


@dataclass(init=False)
class GPTContext:
    request_msg: str
    cont: bool
    regen: bool
    image_urls: list[str]
    generation: int
    deadline: datetime
    request_time: datetime
    prompt_tokens: int


@dataclass
class GPTPermission:
    student: bool
    available: bool


@dataclass
class GPTRequest:
    user: User
    token_usage : TokenUsage
    model_engine: str
    permission: GPTPermission
    context: GPTContext
    plugins: list[str]
    preference: UserPreference


class InputListContentFactory:
    __message: Optional[Message]
    __context: Optional[GPTContext]

    def __init__(self, model_cap: ModelCap):
        self.__model_cap = model_cap

    def set_message(self, message: Message):
        self.__context = None
        self.__message = message
        return self

    def set_context(self, context: GPTContext):
        self.__message = None
        self.__context = context
        return self

    def build(self):
        if self.__message:
            text = self.__message.content
            image_urls = self.__message.blobs
        elif self.__context:
            text = self.__context.request_msg
            image_urls = self.__context.image_urls
        else:
            raise RuntimeError(f"Source not defined for {self.__class__.__name__}")

        if self.__model_cap.image_support and len(image_urls) != 0:
            content = [{"type": "text", "text": text}]
            content.extend(
                [
                    {"type": "image_url", "image_url": {"url": image_url}}
                    for image_url in image_urls
                ]
            )
            return content
        else:
            return text


def build_fcspec(id: str):
    try:
        return fc_get_specs(id)
    except KeyError:
        raise ChatError("无插件匹配")


async def __build_input_list(request: GPTRequest, session: Session):
    context = request.context
    preference = request.preference
    # use_strict_prompt = senword_detector.find(context.msg)

    # 获取并处理历史消息
    attached_message_count = (
        max(request.preference.attached_message_count, 2)
        if context.request_msg == "continue"
        else request.preference.attached_message_count
    )

    history = await session.get_recent_n(
        sessionContext=SessionContext(
            n=attached_message_count,
            with_qcmd=preference.attach_with_qcmd,
            with_regenerated=preference.attach_with_regenerated,
            with_blobs=preference.attach_with_blobs,
            before=context.deadline,
        ),
    )

    # 构造输入
    role = ["assistant", "user"]
    SYSTEM_PREAMBLE = SYSTEM_ROLE

    if preference.use_friendly_sysprompt:
        SYSTEM_PREAMBLE += SYSTEM_ROLE_FRIENDLY_TL.format(str(request.user.username))

    try:
        builder = InputListContentFactory(CHAT_MODELS[request.model_engine])
    except KeyError:
        raise ChatError("无模型匹配")

    input_list = [
        {
            "role": "system",
            "content": SYSTEM_PREAMBLE,
        },
    ]
    input_list.extend(
        [
            {
                "role": role[message.sender],
                "content": builder.set_message(message).build(),
            }
            for message in history
        ]
    )

    input_list.append({"role": "user", "content": builder.set_context(context).build()})

    return input_list


async def handle_message(
    session: Session,
    request: GPTRequest,
) -> Message:
    """消息处理的主入口

    Args:
        user: Django的user对象
        message: 用户输入的消息
        selected_model: 用户选择的模型
        session: 当前会话

    Returns:
        response: Message对象

    Error:
        ChatError: 若出错则抛出并附上对应的status code
    """
    context = request.context
    preference = request.preference
    permission = request.permission

    # 快捷命令
    if context.request_msg[0] == "/":
        resp = await check_and_handle_qcmds(context.request_msg)
        if resp is not None:
            return resp
    # 查询上限
    if not permission.available:
        raise ChatError("您已到达今日使用上限", status=429)

    # if senword_detector_strict.find(context.msg):
    #     time.sleep(1)  # 避免处理太快前端显示闪烁
    #     raise ChatError("请求存在敏感词")

    plugins: list[FCSpec] = functools.reduce(
        lambda x, y: x + y, map(build_fcspec, request.plugins), []
    )

    input_list = await __build_input_list(request, session)

    logger.debug("GPT INPUT:{0}".format(input_list))

    connection = (
        GPTConnectionFactory()
        .model_engine(request.model_engine)
        .mock(OPENAI_MOCK)
        .build()
    )

    response = await connection.interact(
        input_list,
        preference.temperature,
        preference.max_tokens,
        plugins,
    )

    # 输出关键词检测
    # if senword_detector_strict.find(context.msg):
    #     raise ChatError("复存在敏感词，已屏蔽")

    return response


async def summary_title(msg: str) -> tuple[bool, str]:
    """
    用于概括会话标题
    """
    input_list = [
        {"role": "user", "content": msg + "\n用小于五个词概括上述文字"},
    ]
    try:
        connection = (
            GPTConnectionFactory().model_engine("NextChat").mock(OPENAI_MOCK).build()
        )
        response = await connection.interact(
            msg=input_list,
            max_tokens=20,
            temperature=0.1,
            stream=False
        )
    except ChatError:
        return False, ""
    return True, str(response.content)
