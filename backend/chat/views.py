from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.contrib.auth.models import User
from .models import Session, Message
import json
from datetime import datetime, timedelta
import pytz

def get_or_create_user(device_id):
    # 根据设备标识查找或创建对应的用户
    user, created = User.objects.get_or_create(username=device_id)
    return user

@csrf_exempt
def sessions(request):
    if request.method == 'GET':
        device_id = request.headers.get('device-id')  # 假设设备ID作为查询参数
        user = get_or_create_user(device_id)
        sessions = Session.objects.filter(user=user)
        data = [{'id': session.id, 'name': session.name} for session in sessions]
        return JsonResponse(data, safe=False)
    elif request.method == 'POST':
        # 创建新会话，并关联设备ID
        data = json.loads(request.body)
        device_id = data.get('device_id')
        user = get_or_create_user(device_id)
        session = Session.objects.create(name='New Session', user=user)
        data = {'id': session.id, 'name': session.name}
        return JsonResponse(data)

# 删除会话
@csrf_exempt
def delete_session(request, session_id):
    if request.method == 'DELETE':
        try:
            session = Session.objects.get(id=session_id)
            session.delete()
            return JsonResponse({'message': 'Session deleted successfully'})
        except Session.DoesNotExist:
            return JsonResponse({'error': 'Session does not exist'}, status=404)


# 获取会话中的消息内容
def session_messages(request, session_id):
    if request.method == 'GET':
        session = Session.objects.get(id=session_id)
        messages = Message.objects.filter(session=session)
        data = []
        for message in messages:
            # 转换时区和格式
            time_str = message.timestamp.astimezone(pytz.timezone('Asia/Shanghai'))
            time_str = time_str.strftime("%H:%M:%S")
            data.append({
                'id': message.id, 
                'content': message.content,
                'sender': message.sender,
                'time': time_str
            })
        return JsonResponse(data, safe=False)

# 接受用户发送消息并回复
@csrf_exempt
def send_message(request, session_id):
    if request.method == 'POST':
        data = json.loads(request.body)
        user_message = data.get('message')
        # 根据会话标识获取会话对象
        session = Session.objects.get(id=session_id)
        # 创建新的用户消息对象，并关联到会话
        user_message_obj = Message.objects.create(
            sender = 1,
            session = session,
            content = user_message
        )

        # 待替换逻辑
        ai_message = user_message

        # 创建新的 AI 回复消息对象，并关联到会话
        ai_message_obj = Message.objects.create(
            sender = 0,
            session = session,
            content = ai_message
        )
        # 返回服务端生成的回复消息
        return JsonResponse({'message': ai_message, 'timestamp': ai_message_obj.timestamp.isoformat()})


