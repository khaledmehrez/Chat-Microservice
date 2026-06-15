import { Types } from 'mongoose';
import { ReactionResponseType } from './response-config.type';

import { ReactionResponse } from '../api-doc/dtos/response-config.dto';

export class ChatResponseType {
	sender: Types.ObjectId;

	destination: Types.ObjectId;

	content: string;

	isDelivered: boolean;

	conversation: Types.ObjectId;

	_id: Types.ObjectId;
}

export class CreateMessageResponseType extends ChatResponseType {
	reactions: [];
}

export class MarkAsSeenResponseType extends ChatResponseType {
	reactions: [];
	seenAt: Date;
}

export class MarkAsDeliveredResponseType extends ChatResponseType {
	reactions: [];
	seenAt?: Date;
}

export class ReactToMessageResponseType extends ChatResponseType {
	reactions: ReactionResponseType[];
	seenAt: Date;
}

export class GetMessagesByConversationsResponseType extends ChatResponseType {
	isDelivered: boolean;

	reactions: ReactionResponse;

	seenAt?: Date;
}
