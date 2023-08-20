from .plugins.utils import StandardPlugin
from .plugins.canteenPlugin import CanteenPlugin
from .plugins.sjmcPlugin import SjmcPlugin
from .plugins.libraryPlugin import LibraryPlugin
from .plugins.summerInfoPlugin import SummerInfoPlugin

import json

# 支持快捷命令的插件列表
qcmd_plugins_list: list[StandardPlugin] = [
    SjmcPlugin(),
    CanteenPlugin(),
    LibraryPlugin(),
    SummerInfoPlugin(),
]

qcmd_plugins_list_serialized: bytes = json.dumps(
    [plugin.qcmd_description() for plugin in qcmd_plugins_list]
).encode()


def check_and_exec_qcmds(msg: str):
    """快捷命令匹配插件、执行并得到结果

    Args:
        msg(str): 输入消息

    Return:
        flag_trig(bool): 是否触发
        flag_success(bool): 若触发，插件是否成功运行
        response(str): 若触发，返回结果
    """
    for event in qcmd_plugins_list:
        if event.qcmd_trigger(msg):
            flag_success, response = event.qcmd_response(msg)
            return True, flag_success, response
    return False, False, "无插件匹配"
