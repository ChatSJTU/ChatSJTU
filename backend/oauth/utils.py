from authlib.integrations.django_client import OAuth
from chat_sjtu import settings
import os

oauth = OAuth()
oauth.register(
    name='jaccount',
    client_id=settings.AUTHLIB_OAUTH_CLIENTS['jaccount']['client_id'],
    client_secret=settings.AUTHLIB_OAUTH_CLIENTS['jaccount']['client_secret'],
    access_token_url='https://jaccount.sjtu.edu.cn/oauth2/token',
    authorize_url='https://jaccount.sjtu.edu.cn/oauth2/authorize',
    api_base_url='https://api.sjtu.edu.cn/',
    client_kwargs={"scope": "basic"}
)
jaccount = oauth.jaccount

AGREE_USERTYPE = ['faculty','postphd','student']

USE_WHITELIST = False

JACCOUNT_WHITELIST = []
if os.environ.get('JACCOUNT_WHITELIST', None):
    JACCOUNT_WHITELIST += os.environ.get('JACCOUNT_WHITELIST').split(',')