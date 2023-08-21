from chat.core.errors import ChatError
from chat.models.message import Message
from .configs import *
from .plugins.fc import FCSpec

from dataclasses import asdict
from typing import Any, Callable, Coroutine
import tenacity
import logging
import openai

logger = logging.getLogger(__name__)

openai.proxy = os.getenv("OPENAI_PROXY", None)


async def __interact_openai(
    msg: list,
    temperature: float,
    max_tokens: int,
    selected_plugins: list[FCSpec],
    **kwargs,
) -> Message:
    """
    使用openai包与openai api进行交互
    Args:
        msg: 用户输入的消息
        temperature: 生成文本的多样性
        max_tokens: 生成文本的长度
        **kwargs: 其他参数
    Returns:
        response: Message对象
    Error:
        ChatError: 若出错则抛出以及对应的status code
    """

    if selected_plugins:
        kwargs["functions"] = [
            asdict(fc_spec.definition) for fc_spec in selected_plugins
        ]

    func_map = {fc_spec.definition.name: fc_spec for fc_spec in selected_plugins}

    async def __parse_response(
        response: dict, gpt_request_func: Callable[[], Coroutine[Any, Any, dict]]
    ) -> Message:
        finish_reason: str = response["choices"][0]["finish_reason"]
        plugin_group = ""

        if finish_reason == "function_call":

            fc_gpt_resp: dict[str, str] = response["choices"][0]["message"][
                "function_call"
            ]

            fc = func_map[fc_gpt_resp["name"]]
            arguments = fc_gpt_resp["arguments"]
            fc_success, fc_content = await fc.exec(arguments)
            plugin_group = fc.group_id

            if not fc_success:
                raise ChatError(fc_content)

            else:
                msg.append(
                    {
                        "role": "function",
                        "name": fc.definition.name,
                        "content": fc_content,
                    }
                )
                response = await gpt_request_func()

        content: str = response["choices"][0]["message"]["content"]

        return Message(
            sender=0,
            flag_qcmd=False,
            content=content,
            interrupted=finish_reason == "length",
            plugin_group=plugin_group,
        )

    # 重试装饰器
    @tenacity.retry(
        stop=tenacity.stop_after_attempt(3),
        wait=tenacity.wait_random_exponential(min=1, max=5),
        retry=tenacity.retry_if_exception_type(openai.error.OpenAIError),
        before=tenacity.before_log(logger, logging.DEBUG),
        reraise=True,
    )
    async def __interact_with_retry() -> dict:
        try:
            response = await openai.ChatCompletion.acreate(
                messages=msg,
                temperature=temperature,
                max_tokens=max_tokens if not selected_plugins else None,
                **kwargs,
            )

            assert isinstance(response, dict)

            return response

        except openai.error.InvalidRequestError as e:
            logger.error(e)
            raise ChatError("请求失败，输入可能过长，请前往“偏好设置”减少“附带历史消息数”或缩短输入")

        except openai.error.AuthenticationError as e:
            logger.error(e)
            raise ChatError("验证失败，请联系管理员")

        except openai.error.OpenAIError as _:
            raise

        except Exception as e:
            logger.error(e)
            raise ChatError("服务器遇到未知错误")

    try:
        resp = await __interact_with_retry()
        return await __parse_response(resp, __interact_with_retry)

    except openai.error.RateLimitError as e:
        logger.error(e)
        raise ChatError("API受限，请稍作等待后重试，若一直受限请联系管理员")

    except openai.error.OpenAIError as e:
        logger.error(e)
        raise ChatError("API或网络错误，请稍作等待后重试")


async def interact_with_openai_gpt(
    msg: list,
    model_engine="gpt-4",
    temperature=0.5,
    max_tokens=1000,
    selected_plugins: list[FCSpec] = [],
) -> Message:
    # 使用OpenAI API与GPT交互

    openai.api_type = "open_ai"
    openai.organization = OPENAI_ORGANIZATION
    openai.api_key = OPENAI_KEY
    openai.api_base = "https://api.openai.com/v1"
    openai.api_version = None

    return await __interact_openai(
        msg, temperature, max_tokens, selected_plugins, model=model_engine
    )


async def interact_with_azure_gpt(
    msg: list,
    model_engine="gpt-35-turbo-16k",
    temperature=0.5,
    max_tokens=1000,
    selected_plugins: list[FCSpec] = [],
) -> Message:
    # 使用Azure API与GPT交互
    openai.api_type = "azure"
    openai.organization = None
    openai.api_key = AZURE_OPENAI_KEY
    openai.api_base = AZURE_OPENAI_ENDPOINT
    openai.api_version = "2023-07-01-preview"

    return await __interact_openai(
        msg, temperature, max_tokens, selected_plugins, engine=model_engine
    )


"""
与GPT交互，两方API略有不同，但输入输出几乎一致
@msg 用户发送的信息,封装成字典的形式
    需要是如下的结构
    [ {'role':'system', 'content':'xxx'},
        {'role':'user', 'content':'xxx'}
        {'role':'assistant', 'content':'xxx'}
    ]
    system表示对系统的指示,提供整体的指导方针,如'你是学习助手,你的任务是帮助用户学习'，之后输入用户和gpt的多轮对话;
    user表示用户的输入,可以有多轮对话;
    assistant表示gpt的回复,可以是多轮的对话

@model_engine 语言模型的名字

@temperature 代表了回复的自由度,越大则回复的内容越自由. 如果需要要可预测的回复内容,可以设置为0,每次回复的内容相同; 
    如果需要更加自由的回复,可以设置为1,每次回复的内容都不同

@max_tokens 代表了回复的最大长度,如果设置为0,则回复的内容为空;
@return(flag, response) flag为真表示无错误，response为语言模型的回复或错误JSON
"""
