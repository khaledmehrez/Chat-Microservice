import { IsMongoId, IsNotEmpty } from 'class-validator';
import { Types } from 'mongoose';
import { ApiProperty } from '@nestjs/swagger';
import { ObjectId } from 'mongodb';

export class CreateConversationDto {
	@IsNotEmpty()
	@IsMongoId()
	@ApiProperty({ type: ObjectId, example: new ObjectId() })
	match: Types.ObjectId;

	@IsNotEmpty()
	@IsMongoId()
	@ApiProperty({ type: ObjectId, example: new ObjectId() })
	user1: Types.ObjectId;

	@IsNotEmpty()
	@IsMongoId()
	@ApiProperty({ type: ObjectId, example: new ObjectId() })
	user2: Types.ObjectId;
}
