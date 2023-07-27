from django.contrib import admin
from chat.models import Message, UserAccount

# Register your models here.


@admin.register(Message)
class MessageAdmin(admin.ModelAdmin):
    list_display = ('session', 'sender', 'use_model', 'timestamp')
    date_hierarchy = 'timestamp'
    
    def has_change_permission(self, request, obj=None):
        return False

    def has_add_permission(self, request):
        return False

@admin.register(UserAccount)
class UserAccountAdmin(admin.ModelAdmin):
    list_display = ('user', 'usage_count', 'last_used')

    def has_change_permission(self, request, obj=None):
        return False
