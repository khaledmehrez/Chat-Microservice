import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { AbstractService } from '../abstract/abstract.service';
import { Conversation } from './conversation.schema';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { CreateConversationDto } from './conversation.dto';
import { MongoDriverService } from '../database/mongo-driver.service';
import { PaginationDto } from '../abstract/pagination-sort.dto';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { Logger } from 'winston';

@Injectable()
export class ConversationService extends AbstractService<Conversation> {
	constructor(
		@InjectModel(Conversation.name)
		private conversationModel: Model<Conversation>,
		private mongoDriverService: MongoDriverService,
		@Inject(WINSTON_MODULE_PROVIDER) private readonly logger: Logger,
	) {
		super(conversationModel);
	}

	protected modelName = Conversation.name;

	async getConversation(id: Types.ObjectId, pagination: PaginationDto) {
		id = new Types.ObjectId(id);
		const agg = [
			{
				$facet: {
					user1: [
						{
							$match: {
								user1: id,
								hasMessage: true,
								isExcluded: false,
							},
						},
						{
							$lookup: {
								from: 'users',
								localField: 'user2',
								foreignField: '_id',
								as: 'profile',
							},
						},
						{
							$addFields: {
								profile: {
									$first: '$profile',
								},
							},
						},
						{
							$lookup: {
								from: 'chats',
								localField: 'latestMessage',
								foreignField: '_id',
								as: 'latestMessage',
							},
						},
						{
							$addFields: {
								latestMessage: {
									$first: '$latestMessage',
								},
							},
						},
						{
							$lookup: {
								from: 'interactions',
								localField: 'match',
								foreignField: '_id',
								as: 'interaction',
							},
						},
						{
							$addFields: {
								interaction: {
									$first: '$interaction',
								},
							},
						},
						{
							$project: {
								match: 1,
								type: 1,
								user1: 1,
								user2: 1,
								latestMessage: 1,
								updatedAt: 1,
								'interaction.type': 1,
								'interaction.compatibilityScore': 1,
								'interaction.user1InteractionDuration': 1,
								'interaction.user2InteractionDuration': 1,
								'profile.firstName': 1,
								'profile.lastName': 1,
								'profile.gender': 1,
								'profile.job': 1,
								'profile.birthday': {
									$cond: {
										if: '$profile.config.showAge',
										then: '$profile.birthday',
										else: null,
									},
								},
								'profile.tags': 1,
								'profile.pictures': 1,
								'profile.config': 1,
								'profile.geoLocation': {
									$cond: {
										if: '$profile.config.showDistance',
										then: '$profile.geoLocation',
										else: null,
									},
								},
							},
						},
					],
					user2: [
						{
							$match: {
								user2: id,
								hasMessage: true,
								isExcluded: false,
							},
						},
						{
							$lookup: {
								from: 'users',
								localField: 'user1',
								foreignField: '_id',
								as: 'profile',
							},
						},
						{
							$addFields: {
								profile: {
									$first: '$profile',
								},
							},
						},
						{
							$lookup: {
								from: 'chats',
								localField: 'latestMessage',
								foreignField: '_id',
								as: 'latestMessage',
							},
						},
						{
							$addFields: {
								latestMessage: {
									$first: '$latestMessage',
								},
							},
						},
						{
							$lookup: {
								from: 'interactions',
								localField: 'match',
								foreignField: '_id',
								as: 'interaction',
							},
						},
						{
							$addFields: {
								interaction: {
									$first: '$interaction',
								},
							},
						},
						{
							$project: {
								match: 1,
								user1: 1,
								user2: 1,
								latestMessage: 1,
								updatedAt: 1,
								'interaction.type': 1,
								'interaction.compatibilityScore': 1,
								'interaction.user1InteractionDuration': 1,
								'interaction.user2InteractionDuration': 1,
								'profile.firstName': 1,
								'profile.lastName': 1,
								'profile.gender': 1,
								'profile.job': 1,
								'profile.birthday': {
									$cond: {
										if: '$profile.config.showAge',
										then: '$profile.birthday',
										else: null,
									},
								},
								'profile.tags': 1,
								'profile.pictures': 1,
								'profile.config': 1,
								'profile.geoLocation': {
									$cond: {
										if: '$profile.config.showDistance',
										then: '$profile.geoLocation',
										else: null,
									},
								},
							},
						},
					],
				},
			},
			{
				$addFields: {
					conversation: {
						$concatArrays: ['$user1', '$user2'],
					},
				},
			},
			{
				$project: {
					conversation: 1,
				},
			},
			{
				$unwind: {
					path: '$conversation',
					preserveNullAndEmptyArrays: false,
				},
			},
			{
				$sort: {
					'conversation.updatedAt': -1,
				},
			},
			{
				$skip: pagination.skip,
			},
			{
				$limit: pagination.limit,
			},
			{
				$group: {
					_id: '',
					conversations: {
						$push: '$conversation',
					},
				},
			},
			{
				$project: {
					_id: 0,
				},
			},
		];

		return this.mongoDriverService.aggregate('conversations', agg);
	}

	async createConversation(conversation: CreateConversationDto): Promise<Conversation> {
		return this.create(conversation);
	}

	async existingConversation(id: Types.ObjectId): Promise<Conversation> {
		const existingConversation = await this.findById(id);
		if (!existingConversation) {
			throw new NotFoundException('conversation does not exist');
		}
		return existingConversation;
	}

	async excludeConversation(interactionId: Types.ObjectId) {
		const updateResult = await this.updateOne(
			{ match: new Types.ObjectId(interactionId.toString()) },
			{ isExcluded: true },
		);
		this.logger.log('info', {
			message: 'Excluding conversation:',
			result: updateResult,
			data: { interaction: interactionId },
			filter: { match: new Types.ObjectId(interactionId.toString()) },
		});
	}
}
