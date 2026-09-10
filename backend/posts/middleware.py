# chat/middleware.py
from channels.middleware import BaseMiddleware
from channels.db import database_sync_to_async
from rest_framework_simplejwt.tokens import AccessToken
from django.contrib.auth import get_user_model
from django.contrib.auth.models import AnonymousUser
from urllib.parse import parse_qs

User = get_user_model()

class JWTAuthMiddleware(BaseMiddleware):
    async def __call__(self, scope, receive, send):
        print("🔥 MIDDLEWARE HIT")
        print("PATH:", scope["path"])
        print("QUERY:", scope["query_string"])
        query_string = parse_qs(scope['query_string'].decode())
        token = query_string.get('token', [None])[0]
        print("TOKEN EXISTS:", bool(token))

        scope['user'] = await self.get_user(token) if token else AnonymousUser()
        print("USER:", scope["user"])
        return await super().__call__(scope, receive, send)

    @database_sync_to_async
    def get_user(self, token):
        try:
            access_token = AccessToken(token)
            print("TOKEN VALID")
            print("USER ID:", access_token['user_id'])

            user = User.objects.get(id=access_token['user_id'])

            print("USER:", user)
            return User.objects.get(id=access_token['user_id'])
        except Exception:
            return AnonymousUser()