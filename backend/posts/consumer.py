# chat/consumers.py
import json
from channels.generic.websocket import AsyncWebsocketConsumer
from channels.db import database_sync_to_async
from .models import Message

class ChatConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        user = self.scope['user']

        if not user.is_authenticated:
            await self.close()
            return

        self.user = user
        self.group_name = f'user_{user.id}'  # har user ka apna personal group
        await self.channel_layer.group_add(self.group_name, self.channel_name)
        await self.accept()

    async def disconnect(self, close_code):
        if hasattr(self, 'group_name'):
            await self.channel_layer.group_discard(self.group_name, self.channel_name)

    async def receive(self, text_data):
        data = json.loads(text_data)
        to_id = data.get('to')
        message = data.get('message')

        if not to_id or not message:
            return

        saved_message = await self.save_message(self.user.id, to_id, message)

        # sirf receiver ko bhejo (sender already apna message locally add kar chuka hai JS me)
        await self.channel_layer.group_send(
            f'user_{to_id}',
            {
                'type': 'chat_message',
                'from': self.user.id,
                'message': message,
                'timestamp': saved_message.created_at.isoformat(),
            }
        )

    async def chat_message(self, event):
        await self.send(text_data=json.dumps({
            'from': event['from'],
            'message': event['message'],
            'timestamp': event['timestamp'],
        }))

    @database_sync_to_async
    def save_message(self, sender_id, receiver_id, content):
        return Message.objects.create(sender_id=sender_id, receiver_id=receiver_id, content=content)