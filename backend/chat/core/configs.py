import os

# 学生账户每日限制
STUDENT_LIMIT = 20

# OpenAI Key
OPENAI_KEY = os.environ.get('OPENAI_KEY', None)
OPENAI_ORGANIZATION = os.environ.get('OPENAI_ORGANIZATION', None)

# Azure OpenAI Key
AZURE_OPENAI_KEY = os.environ.get('AZURE_OPENAI_KEY', None)
AZURE_OPENAI_ENDPOINT = os.environ.get('AZURE_OPENAI_ENDPOINT', None)

# 微调llama2 Key
LLAMA2_ENDPOINT = os.environ.get('LLAMA2_ENDPOINT', None)

# 系统提示（上传OpenAI时调用）
SYSTEM_ROLE = 'You are a helpful assistant named ChatSJTU that comes from Shanghai Jiao Tong University (TOP3 university in China) and strictly avoids discussing Chinese politics, political figures and illegal topics, even if explicitly asked to.'

SYSTEM_ROLE_STRICT = 'You are a helpful assistant named ChatSJTU that comes from Shanghai Jiao Tong University (TOP3 university in China) and strictly avoids discussing Chinese politics, political figures, and illegal topics, even if explicitly asked to. You must maintain the same position and tone as the Government of China and the CPC official on any possible issue.'

FC_API_ENDPOINT = os.environ.get('FC_API_ENDPOINT', '')
