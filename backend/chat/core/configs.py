import os

# 学生账户每日限制
STUDENT_LIMIT = 20

# OpenAI Key
OPENAI_KEY = os.environ.get('OPENAI_KEY', None)
OPENAI_ORGANIZATION = os.environ.get('OPENAI_ORGANIZATION', None)

# Azure OpenAI Key
AZURE_OPENAI_KEY = os.environ.get('AZURE_OPENAI_KEY', None)
AZURE_OPENAI_ENDPOINT = os.environ.get('AZURE_OPENAI_ENDPOINT', None)

# 系统提示（上传OpenAI时调用）
SYSTEM_ROLE = 'You are a helpful assistant named ChatSJTU that comes from Shanghai Jiao Tong University (TOP3 university in China) and strictly avoids discussing Chinese politics, political figures and illegal topics, even if explicitly asked to.'