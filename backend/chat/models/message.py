from django.db import models
from django.utils import timezone
from .session import Session


class Message(models.Model):
    class Meta:
        verbose_name = "消息"
        verbose_name_plural = verbose_name

    # AI-0 , User-1
    sender = models.IntegerField(verbose_name="发送者")
    session = models.ForeignKey(Session, on_delete=models.CASCADE, db_index=True)
    content = models.TextField(verbose_name="内容")
    flag_qcmd = models.BooleanField(verbose_name="是否为快捷指令回复", default=False)
    interrupted = models.BooleanField(verbose_name="是否由于max_tokens的限制打断", default=False)
    use_model = models.CharField(verbose_name="使用模型", max_length=50, default="")
    timestamp = models.DateTimeField(
        verbose_name="时间", default=timezone.now, db_index=True, editable=True
    )
    regenerated = models.BooleanField(verbose_name="是否为重新生成", default=False)
    generation = models.IntegerField(verbose_name="生成的第几次回答", default=1)

    def __str__(self):
        return self.content
