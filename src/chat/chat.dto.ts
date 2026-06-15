import { Types } from 'mongoose';
import { IsEnum, IsMongoId, IsNotEmpty, IsString } from 'class-validator';
import { ReactionEnum } from '../config/types';
import { ApiProperty } from '@nestjs/swagger';
import { ObjectId } from 'mongodb';

export class MessageDto {
	@IsNotEmpty()
	@IsMongoId()
	@ApiProperty({ type: ObjectId, example: new Types.ObjectId('62600be2fca1f63ae3f3729c') })
	destination: Types.ObjectId;

	@IsNotEmpty()
	@ApiProperty({ example: 'text' })
	content: string;

	@IsNotEmpty()
	@IsMongoId()
	@ApiProperty({
		type: ObjectId,
		example: new ObjectId('62600be2fca1f63ae3f3729c'),
	})
	conversation: Types.ObjectId;
}

export class MessageWithPictureDto {
	@IsNotEmpty()
	@IsMongoId()
	@ApiProperty({ type: ObjectId, example: new Types.ObjectId() })
	sender: Types.ObjectId;

	@IsNotEmpty()
	@IsMongoId()
	@ApiProperty({ type: ObjectId, example: new Types.ObjectId() })
	destination: Types.ObjectId;

	@IsString()
	@IsNotEmpty()
	@ApiProperty({
		example: 'https://lovester-backend-dev.s3.eu-central-1.amazonaws.com/id-verifications/16589363561548689.jpg',
	})
	picture: string;

	@IsNotEmpty()
	@IsMongoId()
	@ApiProperty({
		type: ObjectId,
		example: new ObjectId('62600be2fca1f63ae3f3729c'),
	})
	conversation: Types.ObjectId;
}

export class DeliveredSeenMessageDto {
	@IsNotEmpty()
	@IsMongoId()
	@ApiProperty({ type: ObjectId, example: new Types.ObjectId('62600be2fca1f63ae3f3729c') })
	message: Types.ObjectId;

	@IsNotEmpty()
	@IsMongoId()
	@ApiProperty({ type: ObjectId, example: new Types.ObjectId('62600be2fca1f63ae3f3729c') })
	conversation: Types.ObjectId;
}

export class ReactDto {
	@IsNotEmpty()
	@IsMongoId()
	@ApiProperty({ type: ObjectId, example: new Types.ObjectId('62600be2fca1f63ae3f3729c') })
	messageId: Types.ObjectId;

	@IsNotEmpty()
	@IsEnum(ReactionEnum)
	@ApiProperty({
		type: String,
		examples: [ReactionEnum.like, ReactionEnum.sad],
	})
	reaction: ReactionEnum;
}
