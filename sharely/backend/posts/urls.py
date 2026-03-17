from django.urls import path
from .views import *
from django.conf import settings
from django.conf.urls.static import static

urlpatterns = [
    path('posts/', get_posts),
    # path('posts/search/', search_posts),
    path('create-post/', create_post),
    path('delete-post/<int:post_id>', delete_post),
    path('update-profile/', update_profile),
    path('register/', register),
    path('user/', user_profile),
    path('like/<int:post_id>/', like_post),
    path('comment/<int:post_id>/', add_comment),
    path('comments/<int:comment_id>/', delete_comment)
] 
urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
