import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { AbstractModel } from '../abstract/abstract.model';
import { SchemaTypes, Types } from 'mongoose';
import { Chat } from '../chat/chat.schema';

@Schema({
	timestamps: true,
	autoCreate: true,
	autoIndex: true,
})
export class Conversation extends AbstractModel {
	@Prop({ type: SchemaTypes.ObjectId, require: true })
	match: Types.ObjectId;

	@Prop({ type: SchemaTypes.ObjectId, require: true })
	user1: Types.ObjectId;

	@Prop({ type: SchemaTypes.ObjectId, require: true })
	user2: Types.ObjectId;

	@Prop({ type: Boolean, require: true, default: false })
	hasMessage: boolean;

	@Prop({ type: Boolean, require: true, default: false })
	isExcluded: boolean;

	@Prop({ ref: Chat.name, type: SchemaTypes.ObjectId, require: false })
	latestMessage?: Types.ObjectId;
}

const ConversationSchema = SchemaFactory.createForClass(Conversation);
ConversationSchema.index({ match: 1 }, { unique: false, background: false });
ConversationSchema.index(
	{ user1: 1, hasMessage: 1, hasExcluded: 1, user2: 1, latestMessage: 1, updatedAt: -1 },
	{ unique: false, background: false },
);
ConversationSchema.index(
	{ user2: 1, hasMessage: 1, hasExcluded: 1, updatedAt: -1 },
	{ unique: false, background: false },
);
export { ConversationSchema };
