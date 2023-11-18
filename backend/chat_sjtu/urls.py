from django.contrib import admin
from django.urls import path, include

urlpatterns = [
    path('admin/', admin.site.urls),
    path("api/", include("chat.urls")),
    path("oauth/", include("oauth.urls")),
    path("files/", include("files.urls"))
]
