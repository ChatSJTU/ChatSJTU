from ...configs import FC_API_ENDPOINT
from .basePlugin import BasePlugin

from collections.abc import Callable
from typing import Callable, Awaitable, Union
from dataclasses import dataclass
import aiohttp


def extract_route(route: str) -> tuple[str, str]:
    nxt = route.find("_")
    if nxt == -1:
        return route, ""
    else:
        return route[:nxt], route[nxt + 1 :]


async def dummy_failure(msg: str) -> tuple[bool, str]:
    return False, ""


@dataclass
class FCResponse:
    code: int
    message: str
    data: str


class FCGroup(BasePlugin):
    def __init__(self, name: str, parent: Union[BasePlugin, None]):
        if parent is None:
            self.route = ""
        else:
            self.route = parent.get_route() + "/" + name

        self.name = name

        if not name == "root":
            self.description = {"name": name}
        else:
            self.description = {}

        self.routes: dict[str, FCGroup | FCEndpoint] = dict()

    def add_route(self, route: str, description: str) -> None:
        first, second = extract_route(route)
        print(first, second)
        if second == "":
            self.routes[first] = FCEndpoint(first, description, self)
        else:
            fcgroup = self.routes.get(first, None)

            if fcgroup is None:
                fcgroup = FCGroup(first, self)
            assert isinstance(fcgroup, FCGroup)
            fcgroup.add_route(second, description)
            self.routes[first] = fcgroup

    def get_route(self) -> str:
        return self.route

    def fc_trigger(
        self, route: str
    ) -> tuple[bool, Callable[[str], Awaitable[tuple[bool, str]]]]:
        first, second = extract_route(route)
        fc = self.routes.get(first, None)

        if fc is None:
            return False, dummy_failure
        else:
            return fc.fc_trigger(second)

    def fc_description(self) -> dict | list:
        if self.name == "root":
            return [fc.fc_description() for fc in self.routes.values()]
        else:
            return dict(
                **self.description,
                plugins=[fc.fc_description() for fc in self.routes.values()],
            )


class FCEndpoint(BasePlugin):
    route: str
    description: dict[str, str]

    def __init__(self, path: str, description: str, parent: FCGroup):
        self.route = parent.get_route() + "/" + path
        self.description = {"name": path, "description": description}

    def fc_description(self) -> dict[str, str]:
        return self.description

    def fc_trigger(
        self, path: str
    ) -> tuple[bool, Callable[[str], Awaitable[tuple[bool, str]]]]:
        return True, self.fc_response

    def get_route(self) -> str:
        return self.route

    async def fc_response(self, msg: str) -> tuple[bool, str]:
        assert FC_API_ENDPOINT is not None
        async with aiohttp.ClientSession() as session:
            async with session.post(
                url=FC_API_ENDPOINT + self.route.replace("_", "/"),
                data=msg,
            ) as resp:
                r = FCResponse(**(await resp.json()))
                if r.code == 0:
                    return True, r.data
                else:
                    return False, r.message
