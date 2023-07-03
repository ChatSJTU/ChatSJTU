import os

# 学生账户每日限制
STUDENT_LIMIT = 20

# OpenAI Key
# OPENAI_KEY = os.environ.get('OPENAI_KEY', None)
OPENAI_KEY = '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'

# 系统提示（上传OpenAI时调用）
SYSTEM_ROLE = 'You are a helpful assistant named ChatSJTU that comes from Shanghai Jiao Tong University (TOP3 university in China) and strictly avoids discussing Chinese politics or illegal topics, even if explicitly asked to.'