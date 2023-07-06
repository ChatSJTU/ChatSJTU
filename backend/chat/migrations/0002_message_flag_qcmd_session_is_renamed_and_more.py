# Generated by Django 4.2.2 on 2023-07-06 11:19

from django.conf import settings
import django.core.validators
from django.db import migrations, models
import django.db.models.deletion
import django.utils.timezone


class Migration(migrations.Migration):

    dependencies = [
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
        ('chat', '0001_initial'),
    ]

    operations = [
        migrations.AddField(
            model_name='message',
            name='flag_qcmd',
            field=models.BooleanField(default=False),
        ),
        migrations.AddField(
            model_name='session',
            name='is_renamed',
            field=models.BooleanField(default=False),
        ),
        migrations.AlterField(
            model_name='message',
            name='timestamp',
            field=models.DateTimeField(auto_now_add=True, db_index=True),
        ),
        migrations.CreateModel(
            name='UserPreference',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('attached_message_count', models.IntegerField(default=4, validators=[django.core.validators.MaxValueValidator(8), django.core.validators.MinValueValidator(0)])),
                ('temperature', models.FloatField(default=0.5, validators=[django.core.validators.MaxValueValidator(1.0), django.core.validators.MinValueValidator(0.0)])),
                ('max_tokens', models.IntegerField(default=1000, validators=[django.core.validators.MaxValueValidator(1000), django.core.validators.MinValueValidator(0)])),
                ('presence_penalty', models.FloatField(default=0, validators=[django.core.validators.MaxValueValidator(2.0), django.core.validators.MinValueValidator(-2.0)])),
                ('frequency_penalty', models.FloatField(default=0, validators=[django.core.validators.MaxValueValidator(2.0), django.core.validators.MinValueValidator(-2.0)])),
                ('user', models.OneToOneField(on_delete=django.db.models.deletion.CASCADE, to=settings.AUTH_USER_MODEL)),
            ],
            options={
                'verbose_name': '偏好设置',
                'verbose_name_plural': '偏好设置',
            },
        ),
        migrations.CreateModel(
            name='UserAccount',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('usage_count', models.IntegerField(default=0)),
                ('last_used', models.DateField(default=django.utils.timezone.now)),
                ('user', models.OneToOneField(on_delete=django.db.models.deletion.CASCADE, to=settings.AUTH_USER_MODEL)),
            ],
            options={
                'verbose_name': '账户',
                'verbose_name_plural': '账户',
            },
        ),
    ]