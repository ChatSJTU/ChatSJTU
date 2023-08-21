from .basePlugin import BasePlugin
import requests


class SjmcPlugin(BasePlugin):
    """
    获取SJMC服务器信息插件
    """

    def qcmd_description(self) -> dict[str, str]:
        return {"name": "SJMC", "description": "⛏️获获取 SJMC 服务器信息", "command": "/sjmc"}

    def qcmd_trigger(self, msg: str) -> bool:
        return msg == "/sjmc"

    def qcmd_response(self, msg: str):
        server_list = get_server_list()
        if (server_list is None) or (len(server_list) == 0):
            return False, "快捷命令出现错误"
        resp_str = "上海交通大学 Minecraft 社当前的服务器列表如下："
        for server in server_list:
            resp_str += f"\n* **\"{server.get('title','')}\"**，{server.get('ip','')}"
        return True, resp_str


def get_server_list():
    url = f"https://mc.sjtu.cn/custom/serverlist/?list=sjmc"
    server_list = []
    try:
        res = requests.get(url=url)
        if res.status_code != requests.codes.ok:
            return None
        server_list = res.json()
        return server_list
    except Exception:
        return None
