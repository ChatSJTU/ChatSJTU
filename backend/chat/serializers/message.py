from rest_framework import serializers
from chat.models import Message

class MessageSerializer(serializers.ModelSerializer):
    time = serializers.DateTimeField(
            format='%Y/%m/%d %H:%M:%S',
            source='timestamp')
    class Meta:
        model = Message
        fields = [
            'sender',
            'content',
            'flag_qcmd',
            'use_model',
            'time',
            'interrupted'
            ]
