from rest_framework import serializers
from chat.models import Message
import base64


class MessageSerializer(serializers.ModelSerializer):
    time = serializers.DateTimeField(format="%Y/%m/%d %H:%M:%S", source="timestamp")

    content = serializers.SerializerMethodField()

    class Meta:
        model = Message
        fields = [
            "sender",
            "content",
            "flag_qcmd",
            "use_model",
            "time",
            "interrupted",
            "generation",
            "regenerated",
        ]

    def get_content(self, obj):
        return base64.b64encode(obj.content.encode()).decode()
