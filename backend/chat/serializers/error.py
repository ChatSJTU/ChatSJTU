from rest_framework import serializers

class ChatErrorSerializer(serializers.Serializer):
    error = serializers.CharField(max_length=100)
