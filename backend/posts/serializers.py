from rest_framework import serializers
from .models import *


class CommentSerializer(serializers.ModelSerializer):
    user = serializers.StringRelatedField(read_only=True)

    class Meta:
        model = Comment
        fields = ['id', 'user', 'text', 'created_at']

class registerSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)

    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'password']

    def validate_username(self, value):
        if User.objects.filter(username=value).exists():
            raise serializers.ValidationError("Username already exists")
        return value
    
    def create(self, validated_data):
        user = User.objects.create_user(
            username=validated_data['username'],
            email=validated_data['email'],
            password=validated_data['password']
        )
        return user

class PostSerializer(serializers.ModelSerializer):
    user = serializers.StringRelatedField(read_only=True)
    comments = CommentSerializer(many=True, read_only=True)
    like_count = serializers.SerializerMethodField()
    profile_image = serializers.SerializerMethodField() 

    class Meta:
        ordering = ['-created_at']
        model = Post
        fields = [
            'id',
            'profile_image',   # now valid
            'title',
            'user',
            'content',
            'image',
            'video',
            'created_at',
            'like_count',
            'comments'
        ]


    def get_profile_image(self, obj):
        if hasattr(obj.user, "profile") and obj.user.profile.profile_image:
            return obj.user.profile.profile_image.url
        return None

    def get_like_count(self, obj):
        return Like.objects.filter(post=obj).count()

class ProfileSerializers(serializers.ModelSerializer):
    username = serializers.CharField(source="user.username", read_only=True)
    email = serializers.CharField(source="user.email", read_only=True)
    posts = PostSerializer(many=True, read_only=True, source="user.posts")
    total_posts = serializers.SerializerMethodField()

    class Meta:
        model = Profile
        fields = [
            'username',
            'email',
            'bio',
            'profile_image',
            'total_posts',
            'posts'
        ]

    def get_total_posts(self, obj):
        return obj.user.posts.count()
    
    posts = serializers.SerializerMethodField()

    def get_posts(self, obj):
        posts = obj.user.posts.all().order_by('-created_at')
        return PostSerializer(posts, many=True).data