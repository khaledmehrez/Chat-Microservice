import { Types } from 'mongoose';
import { ApiProperty } from '@nestjs/swagger';
import { ReactionResponse } from './response-config.dto';

export class geoLocationResponse {
	@ApiProperty()
	longitude: number;

	@ApiProperty()
	latitude: number;
}

export class MediaResponse {
	@ApiProperty()
	fileName: string;

	@ApiProperty()
	index: number;

	@ApiProperty()
	isPrivate: boolean;

	@ApiProperty()
	isSafe: boolean;

	@ApiProperty()
	url: string;

	@ApiProperty({ example: new Types.ObjectId() })
	_id: Types.ObjectId;
}

export class ProfileConfigResponse {
	@ApiProperty()
	incognito: boolean;

	@ApiProperty()
	preferredGender: number;

	@ApiProperty()
	ageMaxPreference: number;

	@ApiProperty()
	ageMinPreference: number;

	@ApiProperty()
	maxDistance: number;

	@ApiProperty()
	minDistance: number;
}

export class InteractionResponse {
	@ApiProperty()
	compatibilityScore: number;

	@ApiProperty()
	type: string;

	@ApiProperty()
	user2InteractionDuration: number;
}

export class LatestMessageResponse {
	@ApiProperty({ example: new Types.ObjectId() })
	_id: Types.ObjectId;

	@ApiProperty({ example: new Types.ObjectId() })
	conversation: Types.ObjectId;

	@ApiProperty()
	isDelivered: false;

	@ApiProperty({ type: [ReactionResponse] })
	reactions: ReactionResponse[];

	@ApiProperty()
	content: string;

	@ApiProperty({ example: new Types.ObjectId() })
	destination: Types.ObjectId;

	@ApiProperty({ example: new Types.ObjectId() })
	sender: Types.ObjectId;
}

export class ProfileResponse {
	@ApiProperty({ example: [new Types.ObjectId()] })
	tags: Types.ObjectId[];

	@ApiProperty({ type: ProfileConfigResponse })
	config: ProfileConfigResponse;

	@ApiProperty({ type: [MediaResponse] })
	pictures: MediaResponse[];

	@ApiProperty()
	gender: number;

	@ApiProperty()
	job: string;

	@ApiProperty()
	lastName: string;

	@ApiProperty()
	firstName: string;

	@ApiProperty()
	birthday: Date;

	@ApiProperty({ type: geoLocationResponse })
	geoLocation: geoLocationResponse;
}

export class GetConversationResponse {
	@ApiProperty({ example: new Types.ObjectId() })
	_id: Types.ObjectId;

	@ApiProperty({ example: new Types.ObjectId() })
	user2: Types.ObjectId;

	@ApiProperty({ example: new Types.ObjectId() })
	user1: Types.ObjectId;

	@ApiProperty({ example: new Types.ObjectId() })
	match: Types.ObjectId;

	@ApiProperty()
	updatedAt: Date;

	@ApiProperty({ example: LatestMessageResponse })
	latestMessage: LatestMessageResponse;

	@ApiProperty({ type: ProfileResponse })
	profile: ProfileResponse;

	@ApiProperty({ type: InteractionResponse })
	interaction: InteractionResponse;
}

export class CreateConversationResponse {
	@ApiProperty()
	isExcluded: boolean;

	@ApiProperty()
	hasMessage: boolean;

	@ApiProperty({ example: new Types.ObjectId() })
	user2: Types.ObjectId;

	@ApiProperty({ example: new Types.ObjectId() })
	user1: Types.ObjectId;

	@ApiProperty({ example: new Types.ObjectId() })
	match: Types.ObjectId;

	@ApiProperty({ example: new Types.ObjectId() })
	_id: Types.ObjectId;
}
