from ...configs import FC_API_ENDPOINT
from .basePlugin import BasePlugin

from collections.abc import Callable
from typing import Callable, Awaitable, Union
from dataclasses import dataclass
import functools
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


@dataclass(init=True)
class FCDefinition:
    name: str
    description: str
    parameters: dict


@dataclass
class FCSpec:
    exec: Callable[[str], Awaitable[tuple[bool, str]]]
    group_id: str
    definition: FCDefinition


class FCGroup(BasePlugin):
    route: str
    name: str
    description: dict[str, str]

    def __init__(self, path: str, parent: Union[BasePlugin, None]):
        if parent is None:
            self.route = ""
            self.fcgroup_id = ""
            self.fc_id = ""
        else:
            self.route = parent.get_route() + "/" + path
            self.fcgroup_id = parent.get_fc_id()
            self.fc_id = self.fcgroup_id + "_" + path if self.fcgroup_id else path

        self.path = path

        if not path == "root":
            self.description = {
                "id": self.fc_id,
                "name": path,
                "description": f"Plugin Group {path}",
            }
        else:
            self.description = {}

        self.routes: dict[str, Union[FCGroup, FCEndpoint]] = dict()

    def add_route(self, route: str, definition: FCDefinition) -> None:
        first, second = extract_route(route)
        if second == "":
            self.routes[first] = FCEndpoint(
                path=first, definition=definition, parent=self
            )
        else:
            fcgroup = self.routes.get(first, None)

            if fcgroup is None:
                fcgroup = FCGroup(first, self)
            assert isinstance(fcgroup, FCGroup)
            fcgroup.add_route(route=second, definition=definition)
            self.routes[first] = fcgroup

    def get_fc_id(self) -> str:
        return self.fc_id

    def get_route(self) -> str:
        return self.route

    def get_group_id(self) -> str:
        return self.fcgroup_id

    def get_fc_specs(self) -> list[FCSpec]:
        return functools.reduce(
            lambda x, y: x + y, [fc.get_fc_specs() for fc in self.routes.values()], []
        )

    def fc_trigger(self, route: str) -> tuple[bool, list[FCSpec]]:
        first, second = extract_route(route)
        fc = self.routes.get(first, None)

        if fc is None:
            return False, []
        else:
            if second == "":
                return True, self.get_fc_specs()
            else:
                return self.fc_trigger(second)

    def fc_description(self) -> Union[dict, list]:
        if self.fc_id == "":
            return [fc.fc_description() for fc in self.routes.values()]
        else:
            return dict(
                plugins=[fc.fc_description() for fc in self.routes.values()],
                **self.description,
            )


class FCEndpoint(BasePlugin):
    route: str
    description: dict[str, str]

    def __init__(self, path: str, definition: FCDefinition, parent: FCGroup):
        self.route = parent.get_route() + "/" + path
        self.description = {
            "id": definition.name,
            "name": path,
            "description": definition.description,
        }
        self.definition = definition
        self.fcgroup_id = parent.get_fc_id()
        self.fc_id = self.fcgroup_id + "_" + path

    def fc_description(self) -> dict[str, str]:
        return self.description

    def fc_trigger(self, id: str) -> tuple[bool, FCSpec]:
        return True, FCSpec(
            exec=self.fc_response, group_id=self.fcgroup_id, definition=self.definition
        )

    def get_fc_specs(self) -> list[FCSpec]:
        return [
            FCSpec(
                exec=self.fc_response,
                group_id=self.fcgroup_id,
                definition=self.definition,
            )
        ]

    def get_route(self) -> str:
        return self.route

    def get_fcgroup_id(self) -> str:
        return self.fcgroup_id

    def get_fc_id(self) -> str:
        return self.fc_id

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
