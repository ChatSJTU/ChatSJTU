import json
import logging

from .configs import FC_API_ENDPOINT
from .plugins.utils import StandardPlugin

import requests

logger = logging.getLogger(__name__)

def fc_execute(url: str, argv: str) -> tuple[bool, str]:
    logger.info("enter fc_execute");
    try:
        logger.info(FC_API_ENDPOINT + "/" + url.replace("_","/"));
        argv_json = json.loads(argv);
        resp = requests.post(FC_API_ENDPOINT + "/" + url.replace("_","/"), json = argv_json)
        if (resp.ok):
            resp_json = resp.json()
            if (resp_json["code"] != 0):
                return False, "外部API返回错误："+resp_json["message"]
            logger.info("get external data: "+resp_json["data"]);
            return True, resp_json["data"]
        else:
            logger.info(resp.status_code)
            return False, "请求外部API出现错误，错误码"+str(resp.status_code)
    except Exception as e:
        logger.info(e)
        return False, "请求外部API出现错误"