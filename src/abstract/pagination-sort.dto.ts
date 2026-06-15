import { IsInt, IsNumber, IsOptional, Max, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { Types } from 'mongoose';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class PaginationDto {
	@Type(() => Number)
	@IsInt()
	@Min(0)
	@IsOptional()
	@ApiPropertyOptional()
	skip?: number;

	@Type(() => Number)
	@IsNumber()
	@Min(1)
	@IsOptional()
	@ApiPropertyOptional()
	limit?: number;

	@IsOptional()
	@ApiPropertyOptional()
	startId?: Types.ObjectId;
}

export class SortDirectionDto {
	@Type(() => Number)
	@IsInt()
	@Min(0)
	@Max(1)
	@IsOptional()
	@ApiPropertyOptional()
	createdAt?: number;

	@Type(() => Number)
	@IsInt()
	@Min(0)
	@Max(1)
	@IsOptional()
	@ApiPropertyOptional()
	updatedAt?: number;
}
