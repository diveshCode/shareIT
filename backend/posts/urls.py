from django.urls import path
from .views import *
from django.conf import settings
from django.conf.urls.static import static

urlpatterns = [
    path('posts/', get_posts),
    path('create-post/', create_post),
    path('register/', register),
    path('user/', user_profile),
    path('like/<int:post_id>/', like_post),
    path('comment/<int:post_id>/', add_comment),
] 
urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
