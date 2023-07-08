from .utils import StandardPlugin
import requests
import json

class LibraryPlugin(StandardPlugin):
    """
    获取图书馆信息插件
    """
    def qcmd_trigger(self, msg: str) -> bool:
        return msg == '~lib'
    def qcmd_response(self, msg: str):
        library_list = get_library_list()
        if (library_list == None):
            return False, "快捷命令出现错误"
        if (len(library_list) == 0):
            return True, "图书馆API失效或当前校内图书馆均未开放~"
        resp_str = "当前校内图书馆开放指数（在馆人数/总座位数）如下："
        try:
            for library in library_list:
                resp_str += "\n* **\"%s\"**，在馆人数 %s/%s 人，负荷率 %.2f%%" % (library.get('areaName',''), library.get('inCounter',''), library.get('max',''), (library.get('inCounter','') / library.get('max','') * 100))
            return True, resp_str
        except Exception as e:
            print(e)
            return False, "快捷命令出现错误"


def get_library_list():
    url = f"https://zgrstj.lib.sjtu.edu.cn/cp"
    library_list = []
    try:
        res = requests.get(url=url)
        if res.status_code!= requests.codes.ok:
            return None
        library_list = json.loads(res.text[12:-2])['numbers']
        return library_list
    except Exception as e:
        return None