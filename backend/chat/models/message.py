from django.db import models
from django.contrib.auth.models import User
from .session import Session

class Message(models.Model):
    class Meta:
        verbose_name = '消息'
        verbose_name_plural = verbose_name

    # AI-0 , User-1
    sender = models.IntegerField()
    session = models.ForeignKey(Session, on_delete=models.CASCADE)
    content = models.TextField()
    timestamp = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.content
