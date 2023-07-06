from django.http import JsonResponse
from chat.models import UserPreference, Session
from .utils import *
from .configs import SYSTEM_ROLE
from .plugins.qcmd import *
from .gpt import interact_with_gpt

def handle_message(user, message:str, session:Session.objects):
    """消息处理的主入口

    Args:
        user: Django的user对象
        message: 用户输入的消息
        session: 当前会话

    Returns:
        flag_success: 是否出错(False为错误)
        flag_qcmd: 是否为快捷命令的结果
        responce: 回复(若出错则为错误JSON)
    """
    # 快捷命令
    if (message[0] == '~'):
        flag_trig, flag_success, resp = check_and_exec_qcmds(message)
        if (flag_trig):
            if flag_success:
                return True, True, resp
            else:
                return False, True, JsonResponse({'error': resp}, status = 500)
            
    # 输入关键词检测
    
    # 获取用户偏好设置
    try: 
        user_preference = UserPreference.objects.get(user=user)
    except UserPreference.DoesNotExist:
        return False, False, JsonResponse({'error': '用户信息错误'}, status=404)
    
    # 获取并处理历史消息
    raw_recent_msgs = session.get_recent_n(n = user_preference.attached_message_count)
    role = ['assistant', 'user']
    input_list = [{'role':'system', 'content':SYSTEM_ROLE},]
    input_list.extend([{
        'role': role[message.sender],
        'content': message.content,
        } for message in raw_recent_msgs
    ])
    input_list.append({'role':'user', 'content':message})

    # API交互
    flag, response = interact_with_gpt(
        msg = input_list,
        model_engine='gpt-3.5-turbo',
        temperature = user_preference.temperature,
        max_tokens = user_preference.max_tokens
    )
    if not flag:
        return False, False, JsonResponse(response, status=500)
    
    # 输出关键词检测

    return True, False, response


def summary_title(message: str):
    """
    用于概括会话标题
    """
    input_list = [{'role':'user', 'content':message+' 用少于五个词概括上述请求为完整短标题'},]
    flag, response = interact_with_gpt(
        msg = input_list,
        model_engine='gpt-3.5-turbo',
        max_tokens = 20
    )
    if not flag:
        return False, ''
    
    return True, response
