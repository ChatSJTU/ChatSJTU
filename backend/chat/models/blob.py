from django.db import models
from django.utils import timezone
from .message import Message


class Blob(models.Model):
    class Meta:
        verbose_name = "消息附件"
        verbose_name_plural = verbose_name

    message = models.ForeignKey(Message, on_delete=models.CASCADE, db_index=True)
    location = models.CharField(verbose_name="地址", max_length=128, default="")
    timestamp = models.DateTimeField(
        verbose_name="时间", default=timezone.now
    )
