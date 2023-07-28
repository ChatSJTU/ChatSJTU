from typing import Union
from chat.models import UserPreference, Session, Message
from chat.core.errors import ChatError
from .gpt import interact_with_openai_gpt, interact_with_azure_gpt
from .utils import senword_detector, senword_detector_strict
from .configs import SYSTEM_ROLE, SYSTEM_ROLE_STRICT
from .qcmd import *


from django.contrib.auth.models import User
import time


async def check_and_handle_qcmds(msg: str) -> Union[Message, None]:

    """检查并处理是否为快捷命令

    Args:
        msg: 用户输入的消息
    Returns:
        message: Message对象
    Error:
        ChatError: 若出错则抛出
    """
    flag_trig, flag_success, resp = check_and_exec_qcmds(msg)

    if flag_trig:
        if flag_success:
            return Message(content=resp, flag_qcmd=True, sender=0)
        else:
            raise ChatError(resp)

    return None


async def handle_message(user: User,
                         msg: str,
                         selected_model: str,
                         session: Session,
                         permission: bool) -> Message:

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
    # 快捷命令
    if (msg[0] == '/'):
        resp = await check_and_handle_qcmds(msg)
        if resp is not None:
            return resp

    if permission == False:
        raise ChatError('您已到达今日使用上限', status=429)

    if (senword_detector_strict.find(msg)):
        time.sleep(1)   # 避免处理太快前端显示闪烁
        raise ChatError('请求存在敏感词')

    use_strict_prompt = senword_detector.find(msg)

    # 获取用户偏好设置
    try:
        user_preference = await UserPreference.objects.aget(user=user)
    except UserPreference.DoesNotExist:
        raise ChatError('用户信息错误', status=404)

    # 获取并处理历史消息
    raw_recent_msgs = await session.get_recent_n(n=user_preference.attached_message_count, attach_with_qcmd=user_preference.attach_with_qcmd)

    # 构造输入
    role = ['assistant', 'user']
    input_list = [
        {'role': 'system', 'content': SYSTEM_ROLE_STRICT if use_strict_prompt else SYSTEM_ROLE},]
    input_list.extend([{
        'role': role[message.sender],
        'content': message.content,
    } for message in raw_recent_msgs
    ])

    input_list.append({'role': 'user', 'content': msg})

    # API交互
    if selected_model == 'Azure GPT3.5':
        response = await interact_with_azure_gpt(
            msg=input_list,
            model_engine='gpt-35-turbo-16k',
            temperature=user_preference.temperature,
            max_tokens=user_preference.max_tokens
        )
    elif selected_model == 'OpenAI GPT4':
        response = await interact_with_openai_gpt(
            msg=input_list,
            model_engine='gpt-4',
            temperature=user_preference.temperature,
            max_tokens=user_preference.max_tokens
        )
    else:
        raise ChatError('模型名错误')

    response.use_model = selected_model

    # 输出关键词检测
    if (senword_detector_strict.find(response.content)):
        raise ChatError('回复存在敏感词，已屏蔽')

    return response


async def summary_title(msg: str) -> tuple[bool, str]:
    """
    用于概括会话标题
    """
    input_list = [{'role': 'user', 'content': msg+'\n用小于五个词概括上述文字'},]
    try:
        response = await interact_with_azure_gpt(
            msg=input_list,
            model_engine='gpt-35-turbo-16k',
            max_tokens=20,
            temperature=0.1
        )
    except ChatError:
        return False, ''
    return True, str(response.content)
