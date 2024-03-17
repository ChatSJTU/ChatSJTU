# serializers.py
from rest_framework import serializers
from chat.models.user import UserGroup
from chat.models import UserPreference
from .bill import *


class UserPreferenceSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserPreference
        fields = [
            "attached_message_count",
            "temperature",
            "max_tokens",
            "presence_penalty",
            "frequency_penalty",
            "attach_with_qcmd",
            "attach_with_regenerated",
            "attach_with_blobs",
            "use_friendly_sysprompt",
            "auto_generate_title",
            "render_markdown",
        ]


class UserGroupSerializer(serializers.ModelSerializer):

    usage = serializers.SerializerMethodField()
    bills = serializers.SerializerMethodField()

    class Meta:
        model = UserGroup
        fields = ["name", "balance", "usage", "bills"]

    def get_usage(self, obj):
        return TokenUsageSerializer(list(obj.token_usage_set[:10]), many=True).data

    def get_bills(self, obj):
        return BillSerializer(list(obj.bill_set[:10]), many=True).data

