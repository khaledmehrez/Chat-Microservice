import { Types } from 'mongoose';

export type Reaction = {
	userId: Types.ObjectId;
	reaction: ReactionEnum;
};

export enum ReactionEnum {
	like = 'LIKE',
	dislike = 'DISLIKE',
	love = 'LOVE',
	laugh = 'LAUGH',
	wow = 'WOW',
	sad = 'SAD',
	angry = 'ANGRY',
	xd = 'XD',
}
