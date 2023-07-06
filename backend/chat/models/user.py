from django.db import models
from django.contrib.auth.models import User
from django.utils import timezone
from django.core.validators import MaxValueValidator, MinValueValidator

class UserAccount(models.Model):
    class Meta:
        verbose_name = '账户'
        verbose_name_plural = verbose_name

    user = models.OneToOneField(User, on_delete=models.CASCADE, null=False, blank=False, db_index=True)
    usage_count = models.IntegerField(default=0)
    last_used = models.DateField(default=timezone.now)

    def __str__(self):
        return f'{self.user} : {self.usage_count}'
    
class UserPreference(models.Model):
    class Meta:
        verbose_name = '偏好设置'
        verbose_name_plural = verbose_name

    user = models.OneToOneField(User, on_delete=models.CASCADE, null=False, blank=False, db_index=True)
    attached_message_count = models.IntegerField(default=4, null=False, blank=False, validators=[MaxValueValidator(8), MinValueValidator(0)])
    temperature =  models.FloatField(default=0.5, null=False, blank=False, validators=[MaxValueValidator(1.0), MinValueValidator(0.0)])
    max_tokens = models.IntegerField(default=1000, null=False, blank=False, validators=[MaxValueValidator(1000), MinValueValidator(0)])
    presence_penalty = models.FloatField(default=0, null=False, blank=False, validators=[MaxValueValidator(2.0), MinValueValidator(-2.0)])
    frequency_penalty = models.FloatField(default=0, null=False, blank=False, validators=[MaxValueValidator(2.0), MinValueValidator(-2.0)])