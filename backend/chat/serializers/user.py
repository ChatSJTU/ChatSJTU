# serializers.py
from rest_framework import serializers
from chat.models import UserPreference

class UserPreferenceSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserPreference
        fields = [
            'attached_message_count',
            'temperature',
            'max_tokens',
            'presence_penalty',
            'frequency_penalty',
            'attach_with_qcmd',
            'attach_with_regenerated'
            ]
