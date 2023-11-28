from django.urls import path, include
from rest_framework.routers import DefaultRouter


from . import views

router = DefaultRouter()

urlpatterns = [
    # 获取会话列表 GET ， 新建会话 POST
    path("sessions/", views.sessions, name="sessions"),
    # 获取会话中的消息内容 GET
    path(
        "sessions/<int:session_id>/messages/",
        views.session_messages,
        name="session_messages",
    ),
    # 删除会话 DELETE
    path("sessions/<int:session_id>/", views.delete_session, name="delete_session"),
    # 删除所有会话 DELETE
    path("sessions/delete_all/", views.delete_all_sessions, name="delete_all_sessions"),
    # 修改会话名 POST
    path(
        "sessions/rename/<int:session_id>/", views.rename_session, name="rename_session"
    ),
    # 浏览分享会话 GET
    path(
        "shared",
        views.view_shared_session,
        name="view_shared_session",
    ),
    path(
        "save_shared",
        views.save_shared_session,
        name="save_session",
    ),
    # 分享会话 POST
    path(
        "sessions/share/<int:session_id>/",
        views.share_session,
        name="share_session",
    ),
    # 发送消息 POST
    path("send-message/<int:session_id>/", views.send_message, name="send_message"),
    # 读取或修改用户偏好 GET POST
    path("user-preference/", views.user_preference, name="user_preference"),
    # 读取插件列表
    path("list-plugins/", views.list_plugins, name="list_plugins"),
    # 读取模型列表
    path("list-models/", views.list_models, name="list_models")
]
