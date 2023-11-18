from django.urls import path

from . import views

urlpatterns = [
    path('upload/', views.files_upload, name='files_upload'),
]