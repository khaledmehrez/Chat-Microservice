import { Processor, Process } from '@nestjs/bull';
import { Inject } from '@nestjs/common';
import { Job } from 'bull';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { Logger } from 'winston';
import { ConversationService } from './conversation.service';

@Processor('chat-ms')
export class ConversationConsumer {
	constructor(
		private conversationService: ConversationService,
		@Inject(WINSTON_MODULE_PROVIDER) private readonly logger: Logger,
	) {}

	@Process('exclude-conversation')
	async excludeConversation(job: Job) {
		this.logger.log('info', 'Received Job for exclude-conversation' + JSON.stringify(job.data));
		await this.conversationService.excludeConversation(job.data.interactionId);
	}
}
