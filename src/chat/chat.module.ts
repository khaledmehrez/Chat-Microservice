import { Module } from '@nestjs/common';
import { ChatService } from './chat.service';
import { MongooseModule } from '@nestjs/mongoose';
import { Chat, ChatSchema } from './chat.schema';
import { WebsocketModule } from '../websocket-gateway/websocket.module';
import { ConversationModule } from '../conversation/conversation.module';
import { BullModule } from '@nestjs/bull';
import { ChatControllerV0 } from './chat-v0.controller';

@Module({
	imports: [
		WebsocketModule,
		BullModule.registerQueue({
			name: 'match-ms',
		}),
		BullModule.registerQueue({
			name: 'notification-ms',
		}),
		MongooseModule.forFeature([{ name: Chat.name, schema: ChatSchema }]),
		ConversationModule,
	],
	providers: [ChatService],
	controllers: [ChatControllerV0],
	exports: [ChatService],
})
export class ChatModule {}
