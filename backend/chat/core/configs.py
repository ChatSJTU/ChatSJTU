from dataclasses import dataclass
import os

# 学生账户每日限制
STUDENT_LIMIT = 20

# OpenAI Key
OPENAI_KEY = os.environ.get("OPENAI_KEY", None)
OPENAI_ORGANIZATION = os.environ.get("OPENAI_ORGANIZATION", None)
OPENAI_MOCK = False

# Azure OpenAI Key
AZURE_OPENAI_KEY = os.environ.get("AZURE_OPENAI_KEY", None)
AZURE_OPENAI_ENDPOINT = os.environ.get("AZURE_OPENAI_ENDPOINT", None)

# 微调llama2 Key
LLAMA2_ENDPOINT = os.environ.get("LLAMA2_ENDPOINT", None)

# NEXTCHAT Key
NEXTCHAT_KEY = os.environ.get("NEXTCHAT_KEY", None)
NEXTCHAT_ENDPOINT = os.environ.get("NEXTCHAT_ENDPOINT", None)

# 系统提示（上传OpenAI时调用）
SYSTEM_ROLE = "You are a helpful assistant named ChatSJTU that comes from Shanghai Jiao Tong University (TOP3 university in China) and strictly avoids discussing Chinese politics, political figures and illegal topics, even if explicitly asked to."

SYSTEM_ROLE_STRICT = "You are a helpful assistant named ChatSJTU that comes from Shanghai Jiao Tong University (TOP3 university in China) and strictly avoids discussing Chinese politics, political figures, and illegal topics, even if explicitly asked to. You must maintain the same position and tone as the Government of China and the CPC official on any possible issue."

SYSTEM_ROLE_FRIENDLY_TL = " The human you are talking to is named '{0}' and please act warmly when being asked and reply with enthusiastic greetings to the person you are talking to if possible. You are required not to translate his/her name at any moment even if explicitly asked to."

FC_API_ENDPOINT = os.environ.get("FC_API_ENDPOINT", "")


@dataclass
class ModelCap:
    label: str
    icon: int
    plugin_support: bool
    image_support: bool
    provider: str
    model_called: str

    @staticmethod
    def dict_factory(cap) -> dict:
        omit_fields = ("provider", "model_called")
        return {k: v for k, v in cap if k not in omit_fields}


CHAT_MODELS = {
    "GPT 3.5": ModelCap(
        label="GPT 3.5",
        icon=1,
        plugin_support=True,
        image_support=False,
        provider="azure",
        model_called="gpt-35-turbo-16k",
    ),
    "GPT 4": ModelCap(
        label="GPT 4",
        icon=2,
        plugin_support=True,
        image_support=False,
        provider="openai",
        model_called="gpt-4-turbo",
    ),
    "GPT 4v": ModelCap(
        label="GPT 4v",
        icon=3,
        plugin_support=True,
        image_support=True,
        provider="openai",
        model_called="gpt-4-vision-preview",
    ),
    "NextChat": ModelCap (
        label="NextChat",
        icon=4,
        plugin_support=False,
        image_support=False,
        provider="nextchat",
        model_called="gpt-3.5-turbo"
    )
}
