from django.db import models
from django.contrib.auth.models import User

class Session(models.Model):
    class Meta:
        verbose_name = '会话'
        verbose_name_plural = verbose_name

    user = models.ForeignKey(User, on_delete=models.CASCADE, db_index=True)
    name = models.CharField(max_length=100)

    def __str__(self):
        return f"{self.user} : {self.name}"

    