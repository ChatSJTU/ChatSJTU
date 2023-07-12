from rest_framework.decorators import api_view, authentication_classes, permission_classes
from rest_framework.authentication import SessionAuthentication
from rest_framework.permissions import AllowAny, IsAuthenticated
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
from oauth.models import UserProfile
from chat.models import *
from chat.views import STUDENT_LIMIT

# @api_view(['POST'])
# @authentication_classes([SessionAuthentication])
# @permission_classes([AllowAny])
# def login_deviceID(request):
#     device_id = request.data.get('device_id')
#     if device_id:
#         user, created = User.objects.get_or_create(username=device_id)
#         if user:
#             login(request, user)
#             return JsonResponse({"message": "login success"})
#     return JsonResponse({"message": "login failed"}, status=400)

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

    user_type = claims['type']  # 获取身份，仅教师、学生可用
    if user_type not in AGREE_USERTYPE:
        return JsonResponse({"message": "login failed, no permissions"}, status=403)
    
    account = claims['sub'] # 获取甲亢用户名作为用户名
    if USE_WHITELIST and account not in JACCOUNT_WHITELIST:
        return JsonResponse({"message": "login failed, no permissions"}, status=403)
    
    user, created = User.objects.get_or_create(username=account)
    UserProfile.objects.update_or_create(user=user, defaults={'user_type': user_type})
    UserAccount.objects.update_or_create(user=user)
    UserPreference.objects.update_or_create(user=user)
    if user:
        login(request, user)
        if created:
            Session.objects.create(name='新会话', user=user)
        return JsonResponse({"message": "login success"}, status=200)
    return JsonResponse({"message": "login failed"}, status=400)

# 获取用户信息和账户
@api_view(['GET'])
@authentication_classes([SessionAuthentication])
@permission_classes([IsAuthenticated]) 
def get_user_info(request):
    try:
        user = request.user
        profile = UserProfile.objects.get(user=request.user)
        account = UserAccount.objects.get(user=request.user)
        today = timezone.localtime(timezone.now()).date()
        if account.last_used != today:
            account.usage_count = 0
            account.last_used = today
            account.save()
        user_data = {
            'username': user.username,
            'usertype': profile.user_type,
            'usagecount': account.usage_count,
            'usagelimit': STUDENT_LIMIT if profile.user_type=='student' else -1
        }
        return JsonResponse(user_data)
    except User.DoesNotExist:
        return JsonResponse({'error': 'User does not exist'}, status=404)

# 登出
@api_view(['POST'])
@login_required
def auth_logout(request):
    logout(request)
    return JsonResponse({'detail': '已登出。'})

# 重置用户
@api_view(['DELETE'])
@authentication_classes([SessionAuthentication])
@permission_classes([IsAuthenticated]) 
def logout_and_delete_user(request):
    try:
        # request.user.delete() 对学生账户直接删除会导致用量回满

        sessions = Session.objects.filter(user=request.user)
        sessions.delete()
        profile = UserProfile.objects.filter(user=request.user)
        profile.delete()
        preference = UserPreference.objects.get(user=request.user)
        preference.delete()

        logout(request)
        return JsonResponse({'message': 'User deleted and logged out successfully'})
    except User.DoesNotExist:
        return JsonResponse({'error': 'User does not exist'}, status=404)