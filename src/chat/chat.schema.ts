import { Prop, raw, Schema, SchemaFactory } from '@nestjs/mongoose';
import { AbstractModel } from '../abstract/abstract.model';
import { SchemaTypes, Types } from 'mongoose';
import { Reaction } from '../config/types';

@Schema({
	timestamps: true,
	autoCreate: true,
	autoIndex: true,
})
export class Chat extends AbstractModel {
	@Prop(
		raw({
			type: SchemaTypes.ObjectId,
			require: true,
		}),
	)
	sender: Types.ObjectId;
	@Prop(
		raw({
			type: SchemaTypes.ObjectId,
			require: true,
		}),
	)
	destination: Types.ObjectId;

	@Prop({ required: false })
	content: string;

	@Prop({ required: false })
	picture: string;

	@Prop({ required: false, default: [] })
	reactions?: Reaction[];

	@Prop({ required: false, type: Boolean, default: false })
	isDelivered?: boolean;

	@Prop({ required: false, type: Date })
	seenAt?: Date;

	@Prop(
		raw({
			type: SchemaTypes.ObjectId,
			require: true,
		}),
	)
	conversation: Types.ObjectId;
}

const ChatSchema = SchemaFactory.createForClass(Chat);
ChatSchema.index(
	{ conversation: 1, destination: 1, isDelivered: 1, createdAt: 1 },
	{ unique: false, background: false, name: 'mark-as-delivered' },
);

export { ChatSchema };
