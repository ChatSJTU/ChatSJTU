import json
import logging
import requests
from .plugins.utils import StandardPlugin
from .plugins.canteenPlugin import CanteenPlugin
from .plugins.sjmcPlugin import SjmcPlugin
from .plugins.libraryPlugin import LibraryPlugin
from .plugins.summerInfoPlugin import SummerInfoPlugin
from .configs import FC_API_ENDPOINT

logger = logging.getLogger(__name__)

# 支持快捷命令的插件列表
qcmd_plugins_list = [
    SjmcPlugin(),
    CanteenPlugin(),
    LibraryPlugin(),
    SummerInfoPlugin()
]

try:
    fc_def_res = requests.get(FC_API_ENDPOINT + "/fc/def");
    assert fc_def_res.ok;
    all_plugin: list = json.loads(fc_def_res.content);
    # fc_plugins_dic = {}
    # for item in all_plugin:
    #     fc = next(filter(lambda x: x.getName() == item["name"].split("_")[0], qcmd_plugins_list), None);
    #     if (fc != None):
    #         fc.setFunction(item);
    #         fc_plugins_dic[item["name"].split("_")[0]] = fc;

    logger.info("fc_plugins num:" + str(len(all_plugin)));
except Exception as e:
    logger.error("Plugin init error: " + str(e))

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

