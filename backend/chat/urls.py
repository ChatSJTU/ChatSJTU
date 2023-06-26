from django.urls import path, include
from rest_framework.routers import DefaultRouter

from . import views

router = DefaultRouter()
 
urlpatterns = [
    # 获取会话列表 GET ， 新建会话 POST
    path('sessions/', views.sessions, name='sessions'),
    # 获取会话中的消息内容 GET
    path('sessions/<int:session_id>/messages/', views.session_messages, name='session_messages'),
    # 删除会话 DELETE
    path('sessions/<int:session_id>/', views.delete_session, name='delete_session'),
    # 发送消息 POST
    path('send-message/<int:session_id>/', views.send_message, name='send_message'),
]