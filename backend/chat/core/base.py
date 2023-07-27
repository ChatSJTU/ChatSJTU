from .gpt import interact_with_openai_gpt, interact_with_azure_gpt
from .utils import senword_detector, senword_detector_strict
from .configs import SYSTEM_ROLE, SYSTEM_ROLE_STRICT
from .qcmd import *

from chat.models import UserPreference, Session
from django.http import JsonResponse
import time

async def check_and_handle_qcmds(message:str):
    """检查并处理是否为快捷命令
    
    Args:
        message: 用户输入的消息
    Returns:
        flag_success: 是否出错(False为错误)
        flag_qcmd: 是否为快捷命令的结果
        responce: 回复(若出错则为错误JSON)
    """
    flag_trig, flag_success, resp = await check_and_exec_qcmds(message)
    if (flag_trig):
        if flag_success:
            return True, True, resp
        else:
            return False, True, JsonResponse({'error': resp}, status = 500)
    return True, False, None

async def handle_message(user, message:str, selected_model:str, session:Session.objects):
    """消息处理的主入口

    Args:
        user: Django的user对象
        message: 用户输入的消息
        selected_model: 用户选择的模型
        session: 当前会话

    Returns:
        flag_success: 是否出错(False为错误)
        flag_qcmd: 是否为快捷命令的结果
        responce: 回复(若出错则为错误JSON)
    """
    # 快捷命令
    if (message[0] == '/'):
        flag_trig, flag_success, resp = check_and_exec_qcmds(message)
        if (flag_trig):
            if flag_success:
                return True, True, resp
            else:
                return False, True, JsonResponse({'error': resp}, status = 500)
            
    # 输入关键词检测
    if (senword_detector_strict.find(message)):
        time.sleep(1)   # 避免处理太快前端显示闪烁
        return False, False, JsonResponse({'error': '请求存在敏感词'}, status=500)
    use_strict_prompt = senword_detector.find(message)

    # 获取用户偏好设置
    try: 
        user_preference = await UserPreference.objects.aget(user=user)
    except UserPreference.DoesNotExist:
        return False, False, JsonResponse({'error': '用户信息错误'}, status=404)
    
    # 获取并处理历史消息
    raw_recent_msgs = await session.get_recent_n(n = user_preference.attached_message_count)
    role = ['assistant', 'user']
    input_list = [{'role':'system', 'content':SYSTEM_ROLE_STRICT if use_strict_prompt else SYSTEM_ROLE},]
    input_list.extend([{
        'role': role[message.sender],
        'content': message.content,
        } for message in raw_recent_msgs
    ])
    input_list.append({'role':'user', 'content':message})

    # API交互
    flag = False
    if selected_model == 'Azure GPT3.5':
        flag, response = await interact_with_azure_gpt(
            msg = input_list,
            model_engine='gpt-35-turbo-0613',
            temperature = user_preference.temperature,
            max_tokens = user_preference.max_tokens
        )
    elif selected_model == 'OpenAI GPT4':
        flag, response = await interact_with_openai_gpt(
            msg = input_list,
            model_engine='gpt-4-0613',
            temperature = user_preference.temperature,
            max_tokens = user_preference.max_tokens
        )
    else:
        return False, False, JsonResponse({'error': '模型名错误'}, status=500)
    if not flag:
        return False, False, JsonResponse(response, status=500)
    
    # 输出关键词检测
    if (senword_detector_strict.find(response)):
        return False, False, JsonResponse({'error': '回复存在敏感词，已屏蔽'}, status=500)

    return True, False, response


async def summary_title(message: str):
    """
    用于概括会话标题
    """
    input_list = [{'role':'user', 'content':message+'\n用小于五个词概括上述文字'},]
    flag, response = await interact_with_azure_gpt(
        msg = input_list,
        model_engine='gpt-35-turbo-0613',
        max_tokens = 20,
        temperature = 0.1
    )
    if not flag:
        return False, ''
    
    return True, response
