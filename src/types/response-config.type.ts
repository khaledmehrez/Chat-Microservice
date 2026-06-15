import { Types } from 'mongoose';

export class ReactionResponseType {
	userId: Types.ObjectId;
	reaction: string;
}
