import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Conversation, ConversationSchema } from './conversation.schema';
import { ConversationService } from './conversation.service';
import { WebsocketModule } from '../websocket-gateway/websocket.module';
import { BullModule } from '@nestjs/bull';
import { ConversationConsumer } from './conversation.consumer';
import { ConversationControllerV0 } from './conversation-v0.controller';

@Module({
	imports: [
		WebsocketModule,
		MongooseModule.forFeature([{ name: Conversation.name, schema: ConversationSchema }]),
		BullModule.registerQueue({
			name: 'chat-ms',
		}),
	],
	providers: [ConversationService, ConversationConsumer],
	controllers: [ConversationControllerV0],
	exports: [ConversationService],
})
export class ConversationModule {}
