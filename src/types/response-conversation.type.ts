import { Types } from 'mongoose';
import { ReactionResponseType } from './response-config.type';

export class geoLocationResponseType {
	longitude: number;
	latitude: number;
}

export class MediaResponseType {
	fileName: string;
	index: number;
	isPrivate: boolean;
	isSafe: boolean;
	url: string;
	_id: Types.ObjectId;
}

export class ProfileConfigResponseType {
	incognito: boolean;
	preferredGender: number;
	ageMaxPreference: number;
	ageMinPreference: number;
	maxDistance: number;
	minDistance: number;
}

export class InteractionResponseType {
	compatibilityScore: number;
	type: string;
	user2InteractionDuration: number;
}

export class LatestMessageResponseType {
	_id: Types.ObjectId;
	conversation: Types.ObjectId;
	isDelivered: false;
	reactions: ReactionResponseType[];
	content: string;
	destination: Types.ObjectId;
	sender: Types.ObjectId;
}

export class ProfileResponseType {
	tags: Types.ObjectId[];
	config: ProfileConfigResponseType;
	pictures: MediaResponseType[];
	gender: number;
	job: string;
	lastName: string;
	firstName: string;
	birthday: Date;
	geoLocation: geoLocationResponseType;
}

export class GetConversationResponseType {
	_id: Types.ObjectId;
	user2: Types.ObjectId;
	user1: Types.ObjectId;
	match: Types.ObjectId;
	updatedAt: Date;
	latestMessage: LatestMessageResponseType;
	profile: ProfileResponseType;
	interaction: InteractionResponseType;
}

export class CreateConversationResponseType {
	isExcluded: boolean;
	hasMessage: boolean;
	user2: Types.ObjectId;
	user1: Types.ObjectId;
	match: Types.ObjectId;
	_id: Types.ObjectId;
}
