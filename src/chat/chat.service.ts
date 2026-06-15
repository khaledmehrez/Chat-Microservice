import { Injectable, NotFoundException } from '@nestjs/common';
import { AbstractService } from '../abstract/abstract.service';
import { Chat } from './chat.schema';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { ConversationService } from '../conversation/conversation.service';
import { WebsocketGateway } from '../websocket-gateway/websocket.gateway';
import { DeliveredSeenMessageDto, MessageDto, MessageWithPictureDto, ReactDto } from './chat.dto';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';

@Injectable()
export class ChatService extends AbstractService<Chat> {
	constructor(
		@InjectModel(Chat.name) protected chatModel: Model<Chat>,
		protected conversationService: ConversationService,
		protected websocketGateway: WebsocketGateway,
		@InjectQueue('match-ms') protected matchMsQueue: Queue,
		@InjectQueue('notification-ms') protected notificationMsQueue: Queue,
	) {
		super(chatModel);
	}

	protected modelName = Chat.name;

	async sendMessage(
		sender: Types.ObjectId,
		message?: MessageDto,
		messageWithPicture?: MessageWithPictureDto,
	): Promise<Chat> {
		let messageDocument;
		if (messageWithPicture) messageDocument = messageWithPicture;
		else messageDocument = { sender, ...message };

		const msg = await this.create({ ...messageDocument });
		try {
			const conversation = await this.conversationService.findOneAndUpdate(
				{
					_id: messageDocument.conversation,
					$or: [
						{ user1: sender, user2: messageDocument.destination },
						{ user2: sender, user1: messageDocument.destination },
					],
				},
				{
					latestMessage: msg._id,
					hasMessage: true,
				},
				{ new: false },
			);
			if (!conversation.hasMessage) {
				await this.matchMsQueue.add(
					'update-match-to-chat',
					{
						interactionId: conversation.match,
					},
					{ removeOnComplete: true, attempts: 3 },
				);
			}
			this.websocketGateway.send(messageDocument.destination.toString(), 'new-message', msg);
			await this.notificationMsQueue.add(
				'message_notification',
				{
					user1: sender,
					user2: messageDocument.destination,
					message: msg._id,
					interaction: conversation.match,
					conversation: messageDocument.conversation,
				},
				{ removeOnComplete: true, attempts: 3 },
			);
			return msg;
		} catch (e) {
			await this.deleteOne({ _id: msg._id });
			throw new NotFoundException('CONVERSATION_NOT_FOUND');
		}
	}

	async markAsDelivered(deliveredMessage: DeliveredSeenMessageDto, destination: Types.ObjectId): Promise<Chat> {
		const message = await this.findOneAndUpdate(
			{ _id: new Types.ObjectId(deliveredMessage.message), conversation: deliveredMessage.conversation },
			{ isDelivered: true },
			{ new: true },
			'NOT_FOUND_MESSAGE',
		);
		await this.updateMany(
			{
				destination,
				conversation: deliveredMessage.conversation,
				isDelivered: false,
				createdAt: { $lte: message.createdAt },
			},
			{ isDelivered: true },
		);
		this.websocketGateway.send(message.destination.toString(), 'message-delivered', message);
		this.websocketGateway.send(message.sender.toString(), 'message-delivered', message);

		return message;
	}

	async markAsSeen(seenMessage: DeliveredSeenMessageDto, destination: Types.ObjectId): Promise<Chat> {
		const date = new Date();
		const message = await this.findOneAndUpdate(
			{
				_id: seenMessage.message,
				conversation: seenMessage.conversation,
			},
			{ seenAt: date },
			{ new: true },
			'NOT_FOUND_MESSAGE',
		);
		await this.updateMany(
			{
				destination,
				conversation: seenMessage.conversation,
				seenAt: { $exists: false },
				createdAt: { $lte: message.createdAt },
			},
			{ seenAt: date },
		);
		this.websocketGateway.send(message.sender.toString(), 'message-seen', message);
		this.websocketGateway.send(message.destination.toString(), 'message-seen', message);
		return message;
	}

	async react(id: Types.ObjectId, react: ReactDto): Promise<Chat> {
		const message = await this.findOne({
			_id: react.messageId,
			'reactions.userId': id,
			'reactions.reaction': react.reaction,
		});
		let msg;
		if (message) {
			msg = await this.findByIdAndUpdate(
				react.messageId,
				{ $pull: { reactions: { userId: id } } },
				{ new: true },
				'NOT_FOUND_MESSAGE',
			);
		} else {
			msg = await this.findOneAndUpdate(
				{ _id: react.messageId, 'reactions.userId': id },
				{
					$set: {
						'reactions.$.userId': id,
						'reactions.$.reaction': react.reaction,
					},
				},
				{ new: true },
			);
			if (!msg) {
				const newReaction = {
					userId: id,
					reaction: react.reaction,
				};
				msg = await this.findByIdAndUpdate(
					react.messageId,
					{
						$push: {
							reactions: newReaction,
						},
					},
					{ new: true },
					'NOT_FOUND_MESSAGE',
				);
			}
		}

		this.websocketGateway.send(msg.destination.toString(), 'message-reaction', msg);
		this.websocketGateway.send(msg.sender.toString(), 'message-reaction', msg);

		return msg;
	}
}
