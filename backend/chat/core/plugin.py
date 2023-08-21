from dataclasses import dataclass

from rest_framework.compat import requests

from .configs import FC_API_ENDPOINT
from .plugins import qcmd, fc

import json


# 支持快捷命令的插件列表
qcmd_plugins_list: list[qcmd.BasePlugin] = [
    qcmd.SjmcPlugin(),
    qcmd.CanteenPlugin(),
    qcmd.LibraryPlugin(),
    qcmd.SummerInfoPlugin(),
]


@dataclass(init=True)
class PluginResponse:
    triggered: bool
    success: bool
    content: str


@dataclass(init=True)
class PluginDescription:
    name: str
    description: str
    parameters: dict


def build_FC_Group() -> fc.FCGroup:
    group = fc.FCGroup("root", None)
    assert FC_API_ENDPOINT is not None
    resp: list[dict] = requests.get(FC_API_ENDPOINT + "/fc/def").json()
    for plugin in resp:
        desc = PluginDescription(**plugin)
        group.add_route(desc.name, desc.name, desc.description)
    return group


BaseFC = build_FC_Group()

plugins_list_serialized: bytes = json.dumps(
    {
        "qcmd": [plugin.qcmd_description() for plugin in qcmd_plugins_list],
        "fc": BaseFC.fc_description(),
    }
).encode()


def check_and_exec_qcmds(msg: str) -> PluginResponse:
    """快捷命令匹配插件、执行并得到结果

    Args:
        msg(str): 输入消息

    Return:
        flag_trig(bool): 是否触发
        flag_success(bool): 若触发，插件是否成功运行
        response(str): 若触发，返回结果
    """
    for plugin in qcmd_plugins_list:
        if plugin.qcmd_trigger(msg):
            success, response = plugin.qcmd_response(msg)
            return PluginResponse(triggered=True, success=success, content=response)
    return PluginResponse(triggered=False, success=False, content="无插件匹配")


async def check_and_exec_plugins(name: str, msg: str) -> PluginResponse:
    triggered, func = BaseFC.fc_trigger(name)

    if triggered:
        success, content = await func(msg)
        return PluginResponse(triggered=True, success=success, content=content)
    else:
        return PluginResponse(triggered=False, success=False, content="无插件匹配")
