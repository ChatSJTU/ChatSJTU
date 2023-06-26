from rest_framework.decorators import api_view, authentication_classes, permission_classes
from rest_framework.authentication import SessionAuthentication
from rest_framework.permissions import AllowAny
from django.contrib.auth import authenticate, login

from authlib.integrations.base_client import OAuthError
from authlib.jose import jwt
from authlib.oidc.core import CodeIDToken
from django.contrib.auth import logout, login
from django.contrib.auth.models import User
from django.http import JsonResponse
from django.urls import reverse

from oauth.utils import *

@api_view(['POST'])
@authentication_classes([SessionAuthentication])
@permission_classes([AllowAny])
def login_deviceID(request):
    device_id = request.data.get('device_id')
    print(device_id)
    if device_id:
        user, created = User.objects.get_or_create(username=device_id)
        if user:
            login(request, user)
            return JsonResponse({"message": "login success"})
    return JsonResponse({"message": "login failed"}, status=400)

def auth_logout(request):
    logout(request)
    return JsonResponse({'detail': '已登出。'})

def login_jaccount(request):
    redirect_uri = request.GET.get('redirect_uri', '')
    if redirect_uri == '':
        redirect_uri = request.build_absolute_uri(reverse('auth_jaccount'))
    return jaccount.authorize_redirect(request, redirect_uri)


def auth_jaccount(request):
    try:
        token = jaccount.authorize_access_token(request)
    except OAuthError:
        return JsonResponse({'detail': '参数错误。'}, status=400)
    claims = jwt.decode(token.get('id_token'),
                        jaccount.client_secret, claims_cls=CodeIDToken)
    user_type = claims['type']
    account = claims['sub']
    login_with(request, account, user_type)
    response = JsonResponse({'account': account})
    return response

def login_with(request, username):
    try:
        user = User.objects.get(username=username)
    except User.DoesNotExist:
        user = User.objects.create_user(username=username)
    login(request, user)