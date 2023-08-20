# 插件基类定义
from abc import ABC, abstractmethod


class StandardPlugin(ABC):
    @abstractmethod
    def qcmd_description(self) -> dict[str, str]:
        raise NotImplementedError

    @abstractmethod
    def qcmd_trigger(self, msg: str) -> bool:
        """判断快捷命令是否能够触发

        Args:
            msg(str): 输入消息

        Return:
            flag(bool): 是否能够触发
        """
        raise NotImplementedError

    @abstractmethod
    def qcmd_response(self, msg: str) -> str:
        """快捷命令的回复

        Args:
            msg(str): 输入消息

        Return:
            flag(bool): 是否报错
            response(str): 回复的信息
        """
        raise NotImplementedError
