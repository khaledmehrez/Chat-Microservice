import { Body, Controller, Get, Post, Query, Request, UseGuards, VERSION_NEUTRAL } from '@nestjs/common';
import { ConversationService } from './conversation.service';
import { ResponseObject } from '../abstract/response.object';
import { Promise } from 'mongoose';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { PaginationDto } from '../abstract/pagination-sort.dto';
import { CreateConversationDto } from './conversation.dto';
import { ApiExtraModels, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CustomApiCreatedResponse } from '../api-doc/api-response-schema';
import { CreateConversationResponse, GetConversationResponse } from '../api-doc/dtos/response-conversation.dto';
import { CreateConversationResponseType, GetConversationResponseType } from '../types/response-conversation.type';

@ApiTags('Conversation V0')
@Controller({ path: 'conversation', version: ['0', VERSION_NEUTRAL] })
export class ConversationControllerV0 {
	constructor(private conversationService: ConversationService) {}

	@ApiOperation({
		operationId: 'Get Conversation ',
		description: 'Enables a user to get his conversations  ',
		summary: 'Get Conversation ',
	})
	@ApiExtraModels(GetConversationResponse)
	@CustomApiCreatedResponse('Get Conversation response', 'FOUND_CONVERSATIONS', GetConversationResponse, true)
	@UseGuards(JwtAuthGuard)
	@Get('')
	async getConversation(
		@Request() req,
		@Query() pagination: PaginationDto,
	): Promise<ResponseObject<GetConversationResponseType[]>> {
		const data = await this.conversationService.getConversation(req.auth.user, pagination);
		return new ResponseObject('FOUND_CONVERSATIONS', data[0]?.conversations ?? []);
	}

	@ApiOperation({
		operationId: 'Create Conversation ',
		description: 'Used to create a conversation ',
		summary: 'Create Conversation ',
	})
	@ApiExtraModels(CreateConversationResponse)
	@CustomApiCreatedResponse('Create Conversation response', 'CREATED_CONVERSATION', CreateConversationResponse)
	@Post('')
	async createConversation(
		@Body() conversation: CreateConversationDto,
	): Promise<ResponseObject<CreateConversationResponseType>> {
		const data = await this.conversationService.createConversation(conversation);
		return new ResponseObject('CREATED_CONVERSATION', data);
	}
}
