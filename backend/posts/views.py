from django.shortcuts import get_object_or_404
from rest_framework import status
from rest_framework.decorators import api_view
from rest_framework.response import Response
from .models import *
from .serializers import *
from django.db.models import Q
from rest_framework.permissions import IsAuthenticated
from rest_framework.decorators import permission_classes, parser_classes
from rest_framework.views import APIView
from rest_framework.permissions import AllowAny
from .pagination import PostPagination
from rest_framework.parsers import MultiPartParser, FormParser
from django.contrib.auth.hashers import check_password

@api_view(['GET'])
@permission_classes([AllowAny])
def get_profile(request, username):
    user = get_object_or_404(User, username=username)
    print(user.email)
    profile = get_object_or_404(Profile, user_id=user.id)

    serializer = ProfileDetailSerializer(
        profile,
        context={"request": request}
    )

    return Response(serializer.data)


@permission_classes([AllowAny])
class SendMessageView(APIView):
    def post(self, request):
        print("DATA:", request.data)

        sender_id = request.data.get("sender")
        receiver_id = request.data.get("receiver")
        content = request.data.get("message")

        try:
            # sender = User.objects.get(id=sender_id)
            sender = get_object_or_404(id=sender_id)
            receiver = get_object_or_404(id=receiver_id)
            # receiver = User.objects.get(id=receiver_id)

            msg = Messages.objects.create(
                sender=sender,
                receiver=receiver,
                content=content
            )

            return Response({"status": "saved"})

        except Exception as e:
            print("ERROR:", e)
            return Response({"error": str(e)}, status=400)


@permission_classes([IsAuthenticated])
class ChatHistoryView(APIView):
    def get(self, request, user_id):
        me = request.user

        messages = Messages.objects.filter(
            Q(sender=me, receiver_id=user_id) |
            Q(sender_id=user_id, receiver=me)
        ).order_by("created_at")
        
        serializer = MessageSerializer(messages, many=True)
        return Response(serializer.data)

@api_view(["POST"])
@permission_classes([IsAuthenticated])
def change_password(request):
    serializer = ChangePasswordSerializer(data=request.data)

    if serializer.is_valid():
        user = request.user
        old_password = serializer.validated_data['old_password']
        new_password = serializer.validated_data['new_password']

        if not user.check_password(old_password):
            return Response({"error":"Old password is incorrect."}, status=400)

        user.set_password(new_password)
        user.save()
        return Response({'message':'Password updated successfully'})
    return Response(serializer.errors,status=404)



@api_view(["GET"])
@permission_classes([IsAuthenticated])
def get_posts(request):
    query = request.GET.get("search","").strip()

    if query:
        posts = Post.objects.filter(
            Q(title__icontains=query) |
            Q(content__icontains=query) |
            Q(user__username__icontains=query)
        ).order_by('-created_at')
    else:
        posts = Post.objects.all().order_by('-created_at')

    paginator = PostPagination()
    page = paginator.paginate_queryset(posts, request)
    if page is not None:
        serializer = PostSerializer(page, many=True, context={'request': request})
        return paginator.get_paginated_response(serializer.data)
    serializer = PostSerializer(posts, many=True, context={'request': request})
    return Response(serializer.data)



@api_view(["DELETE"])
@permission_classes([IsAuthenticated])
def delete_comment(request, comment_id):
    try:
        comment = Comment.objects.get(id=comment_id)
    except Comment.DoesNotExist:
        return Response({"error": "Comment not found"}, status=404)

    # 🔐 Allow only comment owner to delete
    if comment.user != request.user:
        return Response({"error": "Not allowed"}, status=403)
    comment.delete()
    return Response({"message": "Comment deleted"}, status=200)



@api_view(["DELETE"])
@permission_classes([IsAuthenticated])
def delete_post(request, post_id):
    try:
        post = Post.objects.get(id=post_id)
    except Post.DoesNotExist:
        return Response({"error": "post not found"}, status=404)

    # 🔐 Allow only comment owner to delete
    if post.user != request.user:
        return Response({"error": "Not allowed"}, status=403)
    post.delete()
    return Response({"message": "Post deleted"}, status=200)




@api_view(['PATCH'])
@permission_classes([IsAuthenticated])
def update_profile(request):
    profile = request.user.profile

    serializer = ProfileUpdateSerializer(
        profile,
        data=request.data,
        partial=True
    )

    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data)
    return Response(serializer.errors, status=400)



@api_view(['POST'])
@permission_classes([AllowAny])
def register(request):
    user = registerSerializer(data=request.data)
    if user.is_valid():
        user.save()
        return Response({"message": "User created successfully","status":"success"}, status=201)
    return Response(user.errors, status=400)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
@parser_classes([MultiPartParser, FormParser])
def create_post(request):
    print(request.FILES)
    serializer = PostSerializer(
        data=request.data,
        context={'request': request}
    )

    if serializer.is_valid():
        serializer.save(user=request.user)
        return Response(serializer.data)

    return Response(serializer.errors)



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



@api_view(['POST'])
@permission_classes([IsAuthenticated])
def add_comment(request, post_id):
    post = get_object_or_404(Post, id=post_id)
    serializer = CommentSerializer(
    data=request.data,
    context={"request": request}
    )

    if serializer.is_valid():
        serializer.save(user=request.user, post=post)
        return Response(serializer.data, status=201)
    return Response(serializer.errors, status=400)




@api_view(['GET'])
@permission_classes([IsAuthenticated])
def user_profile(request):
    profile, created = Profile.objects.get_or_create(user=request.user)

    serializer = ProfileDetailSerializer(profile, context={"request": request})
    return Response(serializer.data)



@api_view(["GET"])
@permission_classes([AllowAny])
def users(request):
    users = User.objects.exclude(id=request.user.id)
    serializer = UsersSerializer(users,many=True, context={"request": request})
    return Response(serializer.data)



@api_view(["GET"])
@permission_classes([IsAuthenticated])
def logged_user(request):
    user = User.objects.get(id=request.user.id)
    serializer = LoggedPerson(user, context={"request": request})
    return Response(serializer.data)