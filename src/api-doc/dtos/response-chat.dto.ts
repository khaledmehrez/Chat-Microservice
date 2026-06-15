import { Types } from 'mongoose';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ReactionResponse } from './response-config.dto';

export class ChatResponse {
	@ApiProperty({ example: new Types.ObjectId() })
	sender: Types.ObjectId;

	@ApiProperty({ example: new Types.ObjectId() })
	destination: Types.ObjectId;

	@ApiProperty()
	content: string;

	@ApiProperty({ example: new Types.ObjectId() })
	conversation: Types.ObjectId;

	@ApiProperty({ example: new Types.ObjectId() })
	_id: Types.ObjectId;
}

export class CreateMessageResponse extends ChatResponse {
	@ApiProperty({ example: false })
	isDelivered: boolean;

	@ApiProperty({ example: [] })
	reactions: [];
}

export class ChatPictureResponse {
	@ApiProperty({ example: new Types.ObjectId() })
	sender: Types.ObjectId;

	@ApiProperty({ example: new Types.ObjectId() })
	destination: Types.ObjectId;

	@ApiProperty()
	picture: string;

	@ApiProperty({ example: new Types.ObjectId() })
	conversation: Types.ObjectId;

	@ApiProperty({ example: new Types.ObjectId() })
	_id: Types.ObjectId;
}

export class CreateMessagePictureResponse extends ChatPictureResponse {
	@ApiProperty({ example: false })
	isDelivered: boolean;

	@ApiProperty({ example: [] })
	reactions: [];
}

export class MarkAsSeenResponse extends ChatResponse {
	@ApiProperty({ example: true })
	isDelivered: boolean;

	@ApiProperty({ example: [] })
	reactions: [];

	@ApiProperty()
	seenAt: Date;
}

export class MarkAsDeliveredResponse extends ChatResponse {
	@ApiProperty({ example: true })
	isDelivered: boolean;

	@ApiProperty({ example: [] })
	reactions: [];
}

export class ReactToMessageResponse extends ChatResponse {
	@ApiProperty({ example: true })
	isDelivered: boolean;

	@ApiProperty({ type: [ReactionResponse] })
	reactions: ReactionResponse;

	@ApiProperty()
	seenAt: Date;
}

export class GetMessagesByConversationsResponse extends ChatResponse {
	@ApiProperty({ example: true })
	isDelivered: boolean;

	@ApiProperty({ type: [ReactionResponse] })
	reactions: ReactionResponse;

	@ApiPropertyOptional()
	seenAt?: Date;
}
