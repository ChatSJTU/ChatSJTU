from rest_framework import serializers
from chat.models import Message


class MessageSerializer(serializers.ModelSerializer):
    time = serializers.DateTimeField(format="%Y/%m/%d %H:%M:%S", source="timestamp")
    image_urls = serializers.SerializerMethodField()

    class Meta:
        model = Message
        fields = [
            "sender",
            "content",
            "flag_qcmd",
            "use_model",
            "image_urls",
            "plugin_group",
            "time",
            "interrupted",
            "generation",
            "regenerated",
        ]

    def get_image_urls(self, obj):
        return list(map(lambda x: x.location, obj.blob_set.all()))
