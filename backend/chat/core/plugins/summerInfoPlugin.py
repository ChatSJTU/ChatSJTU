from .utils import StandardPlugin
import requests

SUMMER_INFO = """<details>
<summary>暑期生活信息详情</summary>
<p>    </p>
<table border="0" cellspacing="0" align="center">
<tr>
    <th colspan="3">
        01 餐饮与商业服务
    </th>
</tr>
<tr>
    <th>
        地点
    </th>
    <th>
        服务时间
    </th> 
    <th>
        联系电话
    </th>
</tr>
<tr>
    <td rowspan="3" align="center">
    第一餐饮大楼
    </td>
    <td>
    一楼（含麦当劳）：正常服务（其中7月21日-23日除四害暂停服务）
    </td>
    <td rowspan="9" align="center">
    <p>一餐、二餐、三餐：</p>
    <p>13918571097</p>
    </td>
</tr>
<tr>
    <td>
    二楼：教工餐厅、自选餐厅7月15日-8月20日暂停服务
    </td>
</tr>
<tr>
    <td>
    民族风味餐厅（原清真餐厅）：升级改造中，于9月8日恢复营业
    </td>
</tr>
<tr>
    <td rowspan="4" align="center">
    第二餐饮大楼
    </td>
    <td>
    一楼小吃广场、绿园餐厅：正常服务（其中7月17日-19日除四害暂停服务）
    </td>
</tr>
<tr>
    <td>
        上海快餐、西式餐厅、大众餐厅：设施维护中，于7月21日恢复营业
    </td>
</tr>
<tr>
    <td>
        教工餐厅：7月1日-8月20日暂停服务
    </td>
</tr>
<tr>
    <td>
        新疆风味餐厅：修缮中，于8月24日恢复营业
    </td>
</tr>
<tr>
    <td rowspan="2" align="center">
        第三餐饮大楼
    </td>
    <td>
        学生餐厅、外婆桥餐厅：正常服务（其中8月5日-7日除四害暂停服务）
    </td>
</tr>
<tr>
    <td>
        民族风味餐厅（原清真餐厅）：正常服务
    </td>
</tr>
<tr>
    <td align="center">
        第四餐饮大楼
    </td>
    <td>
        正常服务（其中7月29日-8月4日设施维护，暂停服务）
    </td>
    <td rowspan="9" align="center">
        <p>四餐、五餐、六餐、七餐、玉兰苑、哈乐：</p>
        <p>15001992458</p>
    </td>
</tr>
<tr>
    <td rowspan="2" align="center">
        第五餐饮大楼
    </td>
    <td>
        正常服务（其中7月24日-28日设施维护，暂停服务）
    </td>
</tr>
<tr>
    <td>
        二楼教工餐厅、大众餐厅：7月22日-8月20日暂停服务
    </td>
</tr>
<tr>
    <td rowspan="3" align="center">
        第六餐饮大楼
    </td>
    <td>
        一楼：正常服务（其中8月11日-13日除四害暂停服务）
    </td>
</tr>
<tr>
    <td>
        二楼教工餐厅：7月22日-8月20日暂停服务
    </td>
</tr>
<tr>
    <td>
        伊诺咖啡：7月17日-9月4日暂停服务
    </td>
</tr>
<tr>
    <td align="center">
        第七餐饮大楼
    </td>
    <td>
        正常服务（其中8月14日-16日除四害暂停服务）
    </td>
</tr>
<tr>
    <td align="center">
        玉兰苑餐饮
    </td>
    <td>
        正常服务（其中8月8日-10日除四害暂停服务）
    </td>
</tr>
<tr>
    <td align="center">
        哈乐餐厅
    </td>
    <td>
        暂停服务，恢复时间另行通知（其中7月14日-16日除四害）
    </td>
</tr>
<tr>
    <td align="center">
        南洋北苑餐厅
    </td>
    <td align="center">
        正常服务
    </td>
    <td rowspan="10" align="center">
        <p>南洋北苑餐厅：</p>
        <p>13120862016</p>
    </td>
</tr>
<tr>
    <td align="center">
        西区教超
    </td>
    <td align="center">
        正常服务
    </td>
</tr>
<tr>
    <td align="center">
        蓁蓁楼教超
    </td>
    <td align="center">
        正常服务
    </td>
</tr>
<tr>
    <td align="center">
        四餐全家
    </td>
    <td align="center">
        正常服务
    </td>
</tr>
<tr>
    <td align="center">
        八期公寓罗森
    </td>
    <td align="center">
        正常服务
    </td>
</tr>
<tr>
    <td align="center">
        二餐便利店
    </td>
    <td align="center">
        正常服务
    </td>
</tr>
<tr>
    <td align="center">
        捭阖坊思源便利店
    </td>
    <td align="center">
        正常服务
    </td>
</tr>
<tr>
    <td align="center">
        二餐理发店
    </td>
    <td align="center">
        正常服务
    </td>
</tr>
<tr>
    <td align="center">
        三餐理发店
    </td>
    <td align="center">
        正常服务
    </td>
</tr>
<tr>
    <td align="center">
        四餐理发店
    </td>
    <td align="center">
        正常服务
    </td>
</tr>
<tr>
    <th colspan="3">
        02 交通保障
    </th>
</tr>
<tr>
    <th colspan="3">
        02-1 教工班车
    </th>
</tr>
<tr>
    <td colspan="3" align="center">
        <p>校内教工班车运行时间（2023年7月17日至9月6日）</p>
    </td>
</tr>
<tr>
    <td colspan="2" align="center">
        <b>
            周一至周五
        </b>
    </td>
    <td rowspan="24" align="center">
        <p>用车联系电话：</p>
        <p>54742488</p>
        <p>54745978</p>
        <p>13916213322</p>
        <p>13681600518</p>
    </td>
</tr>
<tr>
    <td align="center">
        发车时间
    </td>
    <td align="center">
        起止地点
    </td>
</tr>
<tr>
    <td align="center">
        07:30直达
    </td>
    <td rowspan="5" align="center">
        <b>
            徐汇校区→闵行校区 
        </b>
    </td>
</tr>
<tr>
    <td align="center">
        08:30直达
    </td>
</tr>
<tr>
    <td align="center">
        13:15直达
    </td>
</tr>
<tr>
    <td align="center">
        16:30直达
    </td>
</tr>
<tr>
    <td align="center">
        21:30直达
    </td>
</tr>
<tr>
    <td colspan="2">
    </td>
</tr>
<tr>
    <td align="center">
        07:30直达
    </td>
    <td rowspan="5" align="center">
        <b>
            闵行校区→徐汇校区 
        </b>
    </td>
</tr>
<tr>
    <td align="center">
        12:15直达
    </td>
</tr>
<tr>
    <td align="center">
        16:30直达（2辆）
    </td>
</tr>
<tr>
    <td align="center">
        17:30直达
    </td>
</tr>
<tr>
    <td align="center">
        20:00直达
    </td>
</tr>
<tr>
    <td colspan="2">
        备注说明：
    </td>
</tr>
<tr>
    <td colspan="2">
        ★新行政B楼广场一辆16:30发车直达徐汇校区；另一辆菁菁堂候车点16:30发车直达徐汇校车。
    </td>
</tr>
<tr>
    <td colspan="2">
        ★13:15之前班次由北三门进入闵行校区，其它班次由北一门进入闵行校区
    </td>
</tr>
<tr>
    <td colspan="2" align="center">
        <b>
            双休日、节假日 
        </b>
    </td>
</tr>
<tr>
    <td align="center">
        发车时间	
    </td>
    <td align="center">
        起止地点
    </td>
</tr>
<tr>
    <td align="center">
        08:30直达
    </td>
    <th rowspan="2" align="center">
        徐汇校区→闵行校区
    </th>
</tr>
<tr>
    <td align="center">
        17:30直达
    </td>
</tr>
<tr>
    <td colspan="2">
    </td>
</tr>
<tr>
    <td align="center">
        07:30直达
    </td>
    <th rowspan="2" align="center">
        闵行校区→徐汇校区
    </th>
</tr>
<tr>
    <td align="center">
        16:30直达
    </td>
</tr>
<tr>
    <td colspan="2">
        备注说明：班车由北一门进入闵行校区
    </td>
</tr>
<tr>
    <th colspan="3">
        02-2 校园巴士
    </th>
</tr>
<tr>
    <td align="center">
        方向
    </td>
    <td align="center">
        时间
    </td>
    <td rowspan="6"></td>
</tr>
<tr>
    <td align="center">
        顺时针方向
    </td>
    <td>
        <span>09:00、10:00、11:00、13:00、14:00、16:00、</span><span style="color: blue;">17:15</span>
    </td>
</tr>
<tr>
    <td align="center">
        逆时针方向
    </td>
    <td>
        <span style="color: red;">8:15</span><span>、09:30、10:30、11:30、13:30、15:00、</span><span style="color: blue;">16:30</span><span>、</span><span style="color: blue;">18:00</span>
    </td>
</tr>
<tr>
    <td colspan="2">
        <b>
            说明
        </b>
    </td>
</tr>
<tr>
    <td colspan="2">
        ☆周一至周五运行（菁菁堂广场发车），双休日、节假日停驶；
    </td>
</tr>
<tr>
    <td colspan="2">
        ☆红色标注的班次提前10分钟从东川路地铁站乘车点发车，蓝色标注的班次在校内运行一周后开往东川路地铁站乘车点；敬请提前候车。
    </td>
</tr>
<tr>
    <th colspan="3">
        03 维修服务
    </th>
</tr>
<tr>
    <td align="center">
        水电零急修
    </td>
    <td>
        24小时服务，电话：34204215、64932786
    </td>
    <td rowspan="2"></td>
</tr>
<tr>
    <td align="center">
        零急修服务
    </td>
    <td>
        24小时服务，电话：54742421
    </td>
</tr>
</table>
</details>"""

class SummerInfoPlugin(StandardPlugin):
    """
    暑期信息插件
    """
    def qcmd_trigger(self, msg: str) -> bool:
        return msg == '/summer'
    def qcmd_response(self, msg: str):
        return True, SUMMER_INFO