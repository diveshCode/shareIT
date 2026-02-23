from rest_framework.decorators import api_view
from rest_framework.response import Response
from .models import *
from .serializers import PostSerializer, CommentSerializer, registerSerializer, ProfileSerializers

from rest_framework.permissions import IsAuthenticated
from rest_framework.decorators import permission_classes
from rest_framework.permissions import AllowAny



@api_view(['POST'])
@permission_classes([AllowAny])
def register(request):
    user = registerSerializer(data=request.data)
    if user.is_valid():
        user.save()
        return Response({"message": "User created successfully"}, status=201)
    return Response(user.errors, status=400)




@api_view(['POST'])
@permission_classes([IsAuthenticated])
def create_post(request):
    serializer = PostSerializer(data=request.data)
    if serializer.is_valid():
        serializer.save(user=request.user)
        return Response(serializer.data)
    return Response(serializer.errors)





@api_view(['GET'])
@permission_classes([AllowAny])
def get_posts(request):
    posts = Post.objects.all().order_by('-created_at')
    serializer = PostSerializer(posts, many=True)
    return Response(serializer.data)




from django.shortcuts import get_object_or_404
from rest_framework import status

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def like_post(request, post_id):

    post = get_object_or_404(Post, id=post_id)

    like, created = Like.objects.get_or_create(
        user=request.user,
        post=post
    )

    if not created:
        like.delete()

    return Response({
    "like_count": post.likes.count()
}, status=status.HTTP_200_OK)



from django.shortcuts import get_object_or_404
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def add_comment(request, post_id):
    post = get_object_or_404(Post, id=post_id)
    serializer = CommentSerializer(data=request.data)

    if serializer.is_valid():
        serializer.save(user=request.user, post=post)
        return Response({"message": "Comment added"}, status=201)
    return Response(serializer.errors, status=400)




@api_view(['GET'])
@permission_classes([IsAuthenticated])
def user_profile(request):

    profile, created = Profile.objects.get_or_create(user=request.user)

    serializer = ProfileSerializers(profile)
    return Response(serializer.data)