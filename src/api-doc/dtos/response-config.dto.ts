import { ApiProperty } from '@nestjs/swagger';
import { Types } from 'mongoose';

export class ReactionResponse {
	@ApiProperty({ example: new Types.ObjectId() })
	userId: Types.ObjectId;

	@ApiProperty()
	reaction: string;
}
