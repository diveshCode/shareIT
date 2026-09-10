from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import *
# Register your models here.
admin.site.register(Post)
admin.site.register(Comment)
admin.site.register(Like)
admin.site.register(Message)
admin.site.register(Profile)

admin.site.unregister(User)

@admin.register(User)
class CustomUserAdmin(UserAdmin):
    list_display = (
        "id",
        "username",
        "email",
        "first_name",
        "last_name",
        "is_staff",
    )

@admin.register(Follow)
class FollowAdmin(admin.ModelAdmin):
    list_display = (
        "id",
        "follower",
        "following",
        "created_at",
    )