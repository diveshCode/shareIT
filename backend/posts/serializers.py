from rest_framework import serializers
from .models import *


class CommentSerializer(serializers.ModelSerializer):
    user = serializers.StringRelatedField(read_only=True)
    is_owner = serializers.SerializerMethodField()

    class Meta:
        model = Comment
        fields = ['id', 'user', 'text', 'created_at','is_owner']
        
    def get_is_owner(self, obj):
        request = self.context.get("request")

        if not request or not hasattr(request, "user"):
            return False

        if not request.user.is_authenticated:
            return False

        return obj.user == request.user

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
    comments = serializers.SerializerMethodField()
    like_count = serializers.SerializerMethodField()
    profile_image = serializers.SerializerMethodField()
    is_owner = serializers.SerializerMethodField()   # ⭐ ADD THIS

    class Meta:
        model = Post
        fields = [
            'id',
            'profile_image',
            'title',
            'user',
            'content',
            'image',
            'video',
            'created_at',
            'like_count',
            'comments',
            'is_owner'
        ]

    def get_comments(self, obj):
        request = self.context.get("request")
        return CommentSerializer(
            obj.comments.all(),
            many=True,
            context={"request": request}
        ).data

    def get_profile_image(self, obj):
        if hasattr(obj.user, "profile") and obj.user.profile.profile_image:
            return obj.user.profile.profile_image.url
        return None

    def get_like_count(self, obj):
        return Like.objects.filter(post=obj).count()

    def get_is_owner(self, obj):
        request = self.context.get("request")

        if not request or not hasattr(request, "user"):
            return False

        if not request.user.is_authenticated:
            return False

        return obj.user == request.user

class ProfileDetailSerializer(serializers.ModelSerializer):
    username = serializers.CharField(source="user.username", read_only=True)
    email = serializers.CharField(source="user.email", read_only=True)
    total_posts = serializers.SerializerMethodField()
    posts = serializers.SerializerMethodField()

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

    def get_posts(self, obj):
        posts = obj.user.posts.all().order_by('-created_at')
        return PostSerializer(
            posts,
            many=True,
            context=self.context  # 🔥 THIS IS THE FIX
        ).data
    


class ProfileUpdateSerializer(serializers.ModelSerializer):

    username = serializers.CharField(source="user.username")

    class Meta:
        model = Profile
        fields = ['username', 'bio', 'profile_image']

    def validate(self, attrs):

        user_data = attrs.get('user')

        if user_data:
            new_username = user_data.get('username')

            if new_username:
                current_user = self.instance.user

                if User.objects.exclude(id=current_user.id)\
                        .filter(username=new_username)\
                        .exists():
                    raise serializers.ValidationError({
                        "username": "Username already taken."
                    })

        return attrs

    def update(self, instance, validated_data):

        user_data = validated_data.pop('user', None)

        # Update profile fields
        instance.bio = validated_data.get('bio', instance.bio)

        if 'profile_image' in validated_data:
            instance.profile_image = validated_data.get('profile_image')

        instance.save()

        # Update username
        if user_data:
            user = instance.user
            new_username = user_data.get('username')
            if new_username:
                user.username = new_username
                user.save()

        return instance