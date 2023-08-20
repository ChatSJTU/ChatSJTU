from .utils import StandardPlugin
import requests


class CanteenPlugin(StandardPlugin):
    """
    获取就餐指数插件
    """

    def qcmd_description(self) -> dict[str, str]:
        return {"name": "就餐指数", "description": "🍜查询食堂实时就餐指数", "command": "/jczs"}

    def qcmd_trigger(self, msg: str) -> bool:
        return msg == "/jczs"

    def qcmd_response(self, msg: str):
        canteen_list = get_canteen_list()
        if canteen_list is None:
            return False, "快捷命令出现错误"
        if len(canteen_list) == 0:
            return True, "就餐指数API失效或当前校内食堂均未开放~"
        resp_str = "当前校内食堂就餐指数（就餐人数/总座位数）如下："
        try:
            for canteen in canteen_list:
                resp_str += '\n* **"%s"**，就餐指数 %s/%s 人，负荷率 %.2f%%' % (
                    canteen.get("Name", ""),
                    canteen.get("Seat_u", ""),
                    canteen.get("Seat_s", ""),
                    (canteen.get("Seat_u", "") / canteen.get("Seat_s", "") * 100),
                )
            return True, resp_str
        except Exception:
            print(e)
            return False, "快捷命令出现错误"


def get_canteen_list():
    url = f"https://canteen.sjtu.edu.cn/CARD/Ajax/Place"
    canteen_list = []
    try:
        res = requests.get(url=url)
        if res.status_code != requests.codes.ok:
            return None
        canteen_list = res.json()
        return canteen_list
    except Exception as e:
        return None
