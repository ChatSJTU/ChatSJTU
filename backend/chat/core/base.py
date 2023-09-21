from chat.models import UserPreference, Session, Message
from chat.core.errors import ChatError

from .gpt import GPTConnection, GPTConnectionFactory
from .utils import senword_detector, senword_detector_strict
from .configs import OPENAI_MOCK, SYSTEM_ROLE, SYSTEM_ROLE_STRICT
from .plugin import check_and_exec_qcmds, PluginResponse, fc_get_specs
from .plugins.fc import FCSpec

from django.utils.timezone import datetime
from django.contrib.auth.models import User
from dataclasses import dataclass
from typing import Union

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
    msg: str
    cont: bool
    regen: bool
    generation: int
    deadline: datetime
    request_time: datetime


@dataclass
class GPTPermission:
    student: bool
    available: bool


@dataclass
class GPTRequest:
    user: User
    model_engine: str
    permission: GPTPermission
    context: GPTContext
    plugins: list[str]
    preference: UserPreference


def build_fcspec(id: str):
    try:
        return fc_get_specs(id)
    except KeyError:
        raise ChatError("无插件匹配")


async def __build_input_list(request: GPTRequest, session: Session):
    context = request.context
    preference = request.preference
    use_strict_prompt = senword_detector.find(context.msg)

    # 获取并处理历史消息
    attached_message_count = (
        max(request.preference.attached_message_count, 2)
        if context.msg == "continue"
        else request.preference.attached_message_count
    )

    raw_recent_msgs = await session.get_recent_n(
        attached_message_count,
        attach_with_qcmd=preference.attach_with_qcmd,
        attach_with_regenerated=preference.attach_with_regenerated,
        before=context.deadline,
    )

    # 构造输入
    role = ["assistant", "user"]
    input_list = [
        {
            "role": "system",
            "content": SYSTEM_ROLE_STRICT if use_strict_prompt else SYSTEM_ROLE,
        },
    ]
    input_list.extend(
        [
            {
                "role": role[message.sender],
                "content": message.content,
            }
            for message in raw_recent_msgs
        ]
    )

    input_list.append({"role": "user", "content": context.msg})
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
    if context.msg[0] == "/":
        resp = await check_and_handle_qcmds(context.msg)
        if resp is not None:
            return resp
    # 查询上限
    if not permission.available:
        raise ChatError("您已到达今日使用上限", status=429)

    if senword_detector_strict.find(context.msg):
        time.sleep(1)  # 避免处理太快前端显示闪烁
        raise ChatError("请求存在敏感词")

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

    response.session = session
    response.generation = context.generation

    # 输出关键词检测
    if senword_detector_strict.find(context.msg):
        raise ChatError("复存在敏感词，已屏蔽")

    return response


async def summary_title(msg: str) -> tuple[bool, str]:
    """
    用于概括会话标题
    """
    input_list = [
        {"role": "user", "content": msg + "\n用小于五个词概括上述文字"},
    ]
    try:
        connection = GPTConnection(model_engine="gpt-35-turbo-16k")
        response = await connection.interact(
            msg=input_list,
            max_tokens=20,
            temperature=0.1,
        )
    except ChatError:
        return False, ""
    return True, str(response.content)
