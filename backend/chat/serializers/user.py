# serializers.py
from rest_framework import serializers
from chat.models import UserPreference

class UserPreferenceSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserPreference
        fields = ['attached_message_count',]
