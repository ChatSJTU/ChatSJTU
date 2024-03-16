# serializers.py
from rest_framework import serializers
from chat.models.user import UserGroup
from chat.models import UserPreference


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
    class Meta:
        model = UserGroup
        fields = [
            "name",
            "prepaid",
            "completion_tokens",
            "prompt_tokens"
        ]
