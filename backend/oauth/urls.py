from django.urls import path, include

from . import views

urlpatterns = [
    path('logout/', views.auth_logout, name='logout'),
    path('jaccount/login/', views.login_jaccount, name='login_jaccount'),
    path('jaccount/auth/', views.auth_jaccount, name='auth_jaccount'),
    path('deviceid/login/', views.login_deviceID, name='login_deviceID'),
]