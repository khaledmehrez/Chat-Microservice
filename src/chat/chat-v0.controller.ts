import { Body, Controller, Get, Param, Patch, Post, Query, Request, UseGuards, VERSION_NEUTRAL } from '@nestjs/common';
import { ChatService } from './chat.service';
import { DeliveredSeenMessageDto, MarkAsSeenMessageDto, MessageDto, MessageWithPictureDto, ReactDto } from './chat.dto';
import { ResponseObject } from '../abstract/response.object';
import { Types } from 'mongoose';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { PaginationDto } from '../abstract/pagination-sort.dto';
import { ApiExtraModels, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CustomApiCreatedResponse, CustomApiNotFoundResponse } from '../api-doc/api-response-schema';
import {
	ChatPictureResponse,
	ChatResponse,
	CreateMessagePictureResponse,
	CreateMessageResponse,
	GetMessagesByConversationsResponse,
	MarkAsDeliveredResponse,
	MarkAsSeenResponse,
	ReactToMessageResponse,
} from '../api-doc/dtos/response-chat.dto';
import {
	CreateMessageResponseType,
	GetMessagesByConversationsResponseType,
	MarkAsDeliveredResponseType,
	MarkAsSeenResponseType,
	ReactToMessageResponseType,
} from '../types/response-chat.type';

@Controller({ path: 'chat', version: ['0', VERSION_NEUTRAL] })
@ApiTags('Chat V0')
export class ChatControllerV0 {
	constructor(private chatService: ChatService) {}

	@ApiOperation({
		operationId: 'Create message ',
		description: 'Enables a user to send a message  ',
		summary: 'Create message between two users ',
	})
	@ApiExtraModels(ChatResponse, CreateMessageResponse)
	@CustomApiCreatedResponse('Create message response', 'CREATED_MESSAGE', CreateMessageResponse)
	@CustomApiNotFoundResponse('Create message not found response', 'CONVERSATION_NOT_FOUND')
	@UseGuards(JwtAuthGuard)
	@Post('')
	async send(@Request() req, @Body() message: MessageDto): Promise<ResponseObject<CreateMessageResponseType>> {
		const data = await this.chatService.sendMessage(req.auth.user, message);
		return new ResponseObject('CREATED_MESSAGE', data);
	}

	@ApiOperation({
		operationId: 'Create message with a picture.',
		description: 'Enables Media MS to send a picture as a message.',
		summary: 'Create message with a picture.',
	})
	@ApiExtraModels(ChatPictureResponse, CreateMessagePictureResponse)
	@CustomApiCreatedResponse('Send picture as message - Response', 'CREATED_MESSAGE', CreateMessagePictureResponse)
	@CustomApiNotFoundResponse('Conversation not found for user Not found Response', 'CONVERSATION_NOT_FOUND')
	@Post('send-picture')
	async sendMessageWithPicture(
		@Body() message: MessageWithPictureDto,
	): Promise<ResponseObject<CreateMessageResponseType>> {
		const data = await this.chatService.sendMessage(message.sender, null, message);
		return new ResponseObject('CREATED_MESSAGE', data);
	}

	@ApiOperation({
		operationId: 'Mark message as delivered ',
		description: 'Used to mark a message as delivered  ',
		summary: 'Mark message as delivered',
	})
	@ApiExtraModels(MarkAsDeliveredResponse)
	@CustomApiCreatedResponse('Mark message as delivered response', 'UPDATED_MESSAGE', MarkAsDeliveredResponse)
	@Patch('/mark-as-delivered')
	@UseGuards(JwtAuthGuard)
	async markAsDelivered(
		@Body() deliveredMessage: DeliveredSeenMessageDto,
		@Request() req,
	): Promise<ResponseObject<MarkAsDeliveredResponseType>> {
		const data = await this.chatService.markAsDelivered(deliveredMessage, req.auth.user);
		return new ResponseObject('UPDATED_MESSAGE', data);
	}

	@ApiOperation({
		operationId: 'Mark message as seen ',
		description: 'Used to mark a message as seen  ',
		summary: 'Mark message as seen',
	})
	@ApiExtraModels(MarkAsSeenResponse)
	@CustomApiCreatedResponse('Mark message as seen response', 'UPDATED_MESSAGE', MarkAsSeenResponse)
	@Patch('/mark-as-seen')
	@UseGuards(JwtAuthGuard)
	async markAsSeen(
		@Body() seenMessage: MarkAsSeenMessageDto,
		@Request() req,
	): Promise<ResponseObject<MarkAsSeenResponseType>> {
		const data = await this.chatService.markAsSeen(seenMessage, req.auth.user);
		return new ResponseObject('UPDATED_MESSAGE', data);
	}

	@ApiOperation({
		operationId: 'React on a message ',
		description: 'Enables a user to react on a message  ',
		summary: 'React on a message',
	})
	@ApiExtraModels(ReactToMessageResponse)
	@CustomApiCreatedResponse('React on a message response', 'UPDATED_MESSAGE', ReactToMessageResponse)
	@Patch('/react')
	@UseGuards(JwtAuthGuard)
	async react(@Request() req, @Body() react: ReactDto): Promise<ResponseObject<ReactToMessageResponseType>> {
		const data = await this.chatService.react(req.auth.user, react);
		return new ResponseObject('UPDATED_MESSAGE', data);
	}

	@ApiOperation({
		operationId: 'Get messages by conversation',
		description: 'Enables a user to get all messages with another user  ',
		summary: 'Get messages by conversation',
	})
	@ApiExtraModels(GetMessagesByConversationsResponse)
	@CustomApiCreatedResponse(
		'Get messages by conversation response',
		'FOUND_MESSAGES',
		GetMessagesByConversationsResponse,
		true,
	)
	@Get('/by-conversation/:id')
	@UseGuards(JwtAuthGuard)
	async getMessagesByConversation(
		@Param('id') id: Types.ObjectId,
		@Query() pagination: PaginationDto,
	): Promise<ResponseObject<GetMessagesByConversationsResponseType>> {
		const data = await this.chatService.find(
			{ conversation: id },
			null,
			{
				sort: { createdAt: -1 },
				limit: pagination.limit,
				skip: pagination.skip,
			},
			'mark-as-delivered',
		);
		return new ResponseObject('FOUND_MESSAGES', data);
	}
}
