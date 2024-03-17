from rest_framework import serializers
from ..models import TokenUsage, Bill

class BillSerializer(serializers.ModelSerializer):
    class Meta:
        model = Bill
        fields = [
            "datetime",
            "reason",
            "price",
            "details"
        ]


class TokenUsageSerializer(serializers.ModelSerializer):
    class Meta:
        model = TokenUsage
        fields = [
            "model",
            "prompt_tokens",
            "completion_tokens",
            "datetime"
        ]

