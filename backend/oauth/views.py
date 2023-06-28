from rest_framework.decorators import api_view, authentication_classes, permission_classes
from rest_framework.authentication import SessionAuthentication
from rest_framework.permissions import AllowAny
from authlib.integrations.base_client import OAuthError
from authlib.jose import jwt
from authlib.oidc.core import CodeIDToken
from django.contrib.auth.decorators import login_required
from django.views.decorators.csrf import csrf_exempt
from django.contrib.auth import logout, login
from django.contrib.auth.models import User
from django.http import JsonResponse
from django.urls import reverse
import requests
import base64
from oauth.utils import *

@api_view(['POST'])
@authentication_classes([SessionAuthentication])
@permission_classes([AllowAny])
def login_deviceID(request):
    device_id = request.data.get('device_id')
    if device_id:
        user, created = User.objects.get_or_create(username=device_id)
        if user:
            login(request, user)
            return JsonResponse({"message": "login success"})
    return JsonResponse({"message": "login failed"}, status=400)

def login_jaccount(request):
    redirect_uri = request.GET.get('redirect_uri', '')
    if redirect_uri == '':
        redirect_uri = request.build_absolute_uri(reverse('auth_jaccount'))
    response = jaccount.authorize_redirect(request, redirect_uri)
    return response

@api_view(['POST'])
@authentication_classes([SessionAuthentication])
@permission_classes([AllowAny])
def auth_jaccount(request):
    # try:
    #     token = jaccount.authorize_access_token(request)
    # except OAuthError as e:
    #     print('OAuthError:', e)
    #     return JsonResponse({'detail': '参数错误。'}, status=400)
    code = request.data.get('code')
    redirect_uri = request.data.get('redirect_uri')
    client_id = settings.AUTHLIB_OAUTH_CLIENTS['jaccount']['client_id']
    client_secret = settings.AUTHLIB_OAUTH_CLIENTS['jaccount']['client_secret']
    credentials = base64.b64encode(f"{client_id}:{client_secret}".encode("utf-8")).decode("utf-8")
    headers = {
        "Authorization": f"Basic {credentials}",
        "Content-Type": "application/x-www-form-urlencoded"
    }
    data = {
        "grant_type": "authorization_code",
        "code": code,
        "redirect_uri": redirect_uri
    }
    try:
        response = requests.post('https://jaccount.sjtu.edu.cn/oauth2/token', headers=headers, data=data)
        response.raise_for_status()
    except requests.HTTPError as e:
        print('HTTPError:', e)
        return JsonResponse({'detail': '参数错误。'}, status=400)
    token_data = response.json()
    access_token = token_data['access_token']
    id_token = token_data['id_token']
    try:
        claims = jwt.decode(id_token, client_secret, claims_cls=CodeIDToken)
    except jwt.JWTError as e:
        print('JWTError:', e)
        return JsonResponse({'detail': '参数错误。'}, status=400)
    # claims = jwt.decode(token.get('id_token'),
    #                     jaccount.client_secret, claims_cls=CodeIDToken)
    user_type = claims['type']
    account = claims['sub']
    user, created = User.objects.get_or_create(username=account)
    if user:
        login(request, user)
        return JsonResponse({"message": "login success"}, status=200)
    return JsonResponse({"message": "login failed"}, status=400)

# 获取用户信息
@api_view(['GET'])
@login_required
def get_user_info(request):
    user = request.user
    user_data = {
        'username': user.username
    }
    return JsonResponse(user_data)

# 登出
@login_required
def auth_logout(request):
    logout(request)
    return JsonResponse({'detail': '已登出。'})