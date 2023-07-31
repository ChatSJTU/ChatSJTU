from django.db import models
from django.contrib.auth.models import User
from django.utils import timezone
from asgiref.sync import sync_to_async


class Session(models.Model):
    class Meta:
        verbose_name = '会话'
        verbose_name_plural = verbose_name

    user = models.ForeignKey(User, on_delete=models.CASCADE, db_index=True)
    name = models.CharField(max_length=30)
    # 是否被改名过（不直接检测名称是否为默认，保证用户改回为默认的情况）
    is_renamed = models.BooleanField(default=False)
    created_time = models.DateTimeField(
        default=timezone.now, db_index=True, editable=True)

    def __str__(self):
        return f"{self.user} : {self.name}"

    async def get_recent_n(self, n: int,
                           attach_with_qcmd: bool,
                           attach_with_regenerated: bool):  # 获取最近n条
        def wrapper(n: int):
            filters = {}
            if not attach_with_qcmd:
                filters["flag_qcmd"] = False
            if not attach_with_regenerated:
                filters["last_generated"] = True
            return list(self.message_set.filter(**filters).order_by('-timestamp')[:n])

        messages = await sync_to_async(wrapper)(n)

        return messages[::-1]

    # def delete_last_message(self): # 删去最新一条
    #     recent_message = self.message_set.order_by('-timestamp').first()
    #     if recent_message:
    #         recent_message.delete()
