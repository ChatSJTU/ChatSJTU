from django.db import models
from django.contrib.auth.models import User
from django.utils import timezone

class UserFile(models.Model):

    class Meta:
        verbose_name = '用户上传文件'
        verbose_name_plural = verbose_name

    user = models.ForeignKey(User, on_delete=models.CASCADE, db_index=True)
    file_name = models.FileField(upload_to='')
    created_time = models.DateTimeField(
        default=timezone.now, db_index=True, editable=True
    )