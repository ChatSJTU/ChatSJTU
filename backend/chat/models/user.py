from django.db import models
from django.contrib.auth.models import User
from django.utils import timezone

class UserAccount(models.Model):
    class Meta:
        verbose_name = '账户'
        verbose_name_plural = verbose_name

    user = models.OneToOneField(User, on_delete=models.CASCADE, null=False, blank=False)
    usage_count = models.IntegerField(default=0)
    last_used = models.DateField(default=timezone.now)

    def __str__(self):
        return f'{self.user} : {self.usage_count}'