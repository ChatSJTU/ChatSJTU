from .utils import StandardPlugin
from .sjmcPlugin import SjmcPlugin

# 支持快捷命令的插件列表
qcmd_plugins_list = [
    SjmcPlugin(),
]

def check_and_exec_qcmds(msg:str):
    """快捷命令匹配插件、执行并得到结果

    Args:
        msg(str): 输入消息
    
    Return:
        flag_trig(bool): 是否触发
        flag_success(bool): 若触发，插件是否成功运行
        response(str): 若触发，返回结果
    """
    for event in qcmd_plugins_list:
        event : StandardPlugin
        try:
            if event.qcmd_trigger(msg):
                flag_success, response = event.qcmd_response(msg)
                return True, flag_success, response
        except:
            return False, False, '无插件匹配'
    return False, False, '无插件匹配'

