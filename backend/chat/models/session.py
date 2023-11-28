from typing import Any, Union
from django.db import models
from django.contrib.auth.models import User
from django.utils import timezone
from asgiref.sync import sync_to_async
from dataclasses import dataclass


@dataclass
class SessionContext:
    n: int
    with_qcmd: bool
    with_regenerated: bool
    with_blobs: bool
    before: timezone.datetime


class Session(models.Model):
    class Meta:
        verbose_name = "会话"
        verbose_name_plural = verbose_name

    user = models.ForeignKey(User, on_delete=models.CASCADE, db_index=True)
    name = models.CharField(max_length=30)
    # 是否被改名过（不直接检测名称是否为默认，保证用户改回为默认的情况）
    is_renamed = models.BooleanField(default=False)
    created_time = models.DateTimeField(
        default=timezone.now, db_index=True, editable=True
    )
    deleted_time = models.DateTimeField(blank=True, null=True, editable=True)

    def __str__(self):
        return f"{self.user} : {self.name}"

    async def get_recent_n(
        self,
        sessionContext: SessionContext,
    ):  # 获取最近n条
        def __request_recent_n(n: int):
            filters: dict[str, Union[bool, timezone.datetime]] = {
                "timestamp__lt": sessionContext.before
            }

            if not sessionContext.with_qcmd:
                filters["flag_qcmd"] = False
            if not sessionContext.with_regenerated:
                filters["regenerated"] = False
            messages = list(self.message_set.filter(**filters).order_by("-timestamp")[:sessionContext.n])

            if sessionContext.with_blobs:
                for message in messages:
                    message.blobs = list(message.blob_set.order_by("-timestamp").all())
            return messages

        messages = await sync_to_async(__request_recent_n)(sessionContext.n)

        return messages[::-1]


class SessionShared(models.Model):
    class Meta:
        verbose_name = "共享会话"
        verbose_name_plural = verbose_name

    session = models.ForeignKey(Session, on_delete=models.CASCADE, db_index=True)
    created_time = models.DateTimeField(default=timezone.now, editable=True)
    deadline = models.DateTimeField(editable=True)
    snapshot = models.TextField(default="{}", editable=True)
    share_id = models.BigIntegerField(
        db_index=True,
        editable=True,
        unique=True,
    )
