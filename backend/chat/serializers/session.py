from rest_framework import serializers
from chat.models import Session

class SessionSerializer(serializers.ModelSerializer):
    
    rounds = serializers.SerializerMethodField()
    updated_time = serializers.SerializerMethodField()

    class Meta:
        model = Session
        fields = [
            'id',
            'name',
            'rounds',
            'updated_time',
            ]
    
    def get_rounds(self, obj):
        return obj.message_set.filter(sender = 0).count()

    def get_updated_time(self, obj):
        try:
            return obj.message_set.filter(sender = 0).order_by('-timestamp').first().timestamp
        except AttributeError as _ :
            return obj.created_time
