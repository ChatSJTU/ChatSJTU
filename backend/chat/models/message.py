from django.db import models
from django.utils import timezone
from .session import Session

class Message(models.Model):
    class Meta:
        verbose_name = '消息'
        verbose_name_plural = verbose_name

    # AI-0 , User-1
    sender = models.IntegerField()
    session = models.ForeignKey(Session, on_delete=models.CASCADE, db_index=True)
    content = models.TextField()
    flag_qcmd = models.BooleanField(verbose_name='是否为快捷指令回复', default=False)
    use_model = models.CharField(verbose_name='使用模型', max_length=50, default='')
    timestamp = models.DateTimeField(default=timezone.now, db_index=True, editable=True)

    def __str__(self):
        return self.content
