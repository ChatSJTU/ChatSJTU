from abc import ABC, abstractmethod

from typing import Callable, Awaitable


class BasePlugin(ABC):
    @abstractmethod
    def fc_description(self) -> dict[str, str]:
        raise NotImplementedError

    @abstractmethod
    def fc_trigger(
        self, path: str
    ) -> tuple[bool, Callable[[str], Awaitable[tuple[bool, str]]]]:
        """判断快捷命令是否能够触发

        Args:
            msg(str): 输入消息

        Return:
            flag(bool): 是否能够触发
        """
        raise NotImplementedError

    @abstractmethod
    def get_route(self) -> str:
        raise NotImplementedError
