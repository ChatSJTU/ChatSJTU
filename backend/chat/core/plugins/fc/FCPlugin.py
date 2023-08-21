from ...configs import FC_API_ENDPOINT

from typing import Callable, Awaitable, Union
from dataclasses import dataclass
import aiohttp


@dataclass
class FCResponse:
    code: int
    message: str
    data: str


@dataclass
class FCDefinition:
    name: str
    description: str
    parameters: dict


@dataclass
class FCGroupDefinition:
    id: str
    name: str
    icon: str
    description: str
    functions: list[FCDefinition]


@dataclass
class FCSpec:
    exec: Callable[[str], Awaitable[tuple[bool, str]]]
    group_id: str
    definition: FCDefinition


class FCGroup:
    def __init__(self, definition: FCGroupDefinition):
        self.fc_id = definition.id
        self.description = definition.description
        self.name = definition.name
        self.icon = definition.icon
        self.functions = list(
            map(lambda x: FCEndpoint(self.fc_id, x), definition.functions)
        )

    def fc_get_all_specs(self) -> list[FCSpec]:
        return list(map(lambda function: function.fc_get_spec(), self.functions))

    def fc_description(self) -> Union[dict, list]:
        return {
            "id": self.fc_id,
            "name": self.name,
            "icon": self.icon,
            "description": self.description,
        }


class FCEndpoint:
    def __init__(self, group_id: str, definition: FCDefinition):
        self.route = definition.name.replace("_", "/")
        self.fc_id = definition.name
        self.fcgroup_id = group_id
        self.definition = definition

    def fc_get_spec(self) -> FCSpec:
        return FCSpec(
            exec=self.fc_response, group_id=self.fcgroup_id, definition=self.definition
        )

    def get_fcgroup_id(self):
        return self.fcgroup_id

    async def fc_response(self, msg: str) -> tuple[bool, str]:
        assert FC_API_ENDPOINT is not None
        async with aiohttp.ClientSession() as session:
            async with session.post(
                url=FC_API_ENDPOINT + "/" + self.route,
                headers={"content-type": "application/json"},
                data=msg,
            ) as resp:
                r = FCResponse(**(await resp.json()))
                if r.code == 0:
                    return True, r.data
                else:
                    return False, r.message
