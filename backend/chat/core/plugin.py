from .configs import FC_API_ENDPOINT
from .plugins import qcmd, fc

from dataclasses import dataclass
from dacite import from_dict
import requests
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


def build_fc_group_list() -> dict[str, fc.FCGroup]:
    assert FC_API_ENDPOINT is not None
    resp = requests.get(FC_API_ENDPOINT + "/fc/def").json()

    group_definitions = [
        from_dict(data_class=fc.FCGroupDefinition, data=r) for r in resp["data"]
    ]

    groups = {definition.id: fc.FCGroup(definition) for definition in group_definitions}

    return groups


fc_group_list: dict[str, fc.FCGroup] = build_fc_group_list()


def fc_get_specs(id: str) -> list[fc.FCSpec]:
    group: fc.FCGroup = fc_group_list[id]
    return group.fc_get_all_specs()


plugins_list_serialized: bytes = json.dumps(
    {
        "qcmd": [plugin.qcmd_description() for plugin in qcmd_plugins_list],
        "fc": [group.fc_description() for group in fc_group_list.values()],
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
    return PluginResponse(triggered=False, success=False, content="无指令匹配")
