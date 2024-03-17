from decimal import Decimal
from django.db import models
from .user import UserGroup


class TokenUsage(models.Model):
    class Meta:
        verbose_name = "每日用量"
        verbose_name_plural = verbose_name
        ordering = ["-datetime"]

    group = models.ForeignKey(UserGroup, on_delete=models.SET_NULL, null=True)
    model = models.CharField(max_length=32, blank=False, null=False)
    prompt_tokens = models.IntegerField(default=0)
    completion_tokens = models.IntegerField(default=0)
    datetime = models.DateField(auto_now_add=False)

class Bill(models.Model):
    class Meta:
        verbose_name = "账单"
        verbose_name_plural = verbose_name
        ordering = ["-datetime"]

    group = models.ForeignKey(UserGroup, on_delete=models.SET_NULL, null = True)
    datetime = models.DateField(auto_now_add=True)
    reason = models.CharField(max_length=32, blank=False, null=False)
    price = models.DecimalField(default=Decimal("0.00"), max_digits=6, decimal_places=2)
    details = models.CharField(max_length=128, blank=False, null=False)
