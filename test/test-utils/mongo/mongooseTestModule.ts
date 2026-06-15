import { MongooseModule, MongooseModuleOptions } from '@nestjs/mongoose';
import { MongoClient, ObjectId } from 'mongodb';
import fs = require('fs');
import path = require('path');

export const rootMongooseTestModule = (options: MongooseModuleOptions = {}) =>
	MongooseModule.forRootAsync({
		useFactory: async () => {
			const client = await MongoClient.connect(options.uri);
			const db = client.db('lovester');
			const data1 = fs.readFileSync(path.resolve(__dirname, 'user.json'));
			const docs1 = JSON.parse(data1.toString());
			const users = docs1.map((user) => {
				const u = user;
				u._id = ObjectId.createFromHexString(user._id);
				u.pictures = user.pictures.map((picture) => {
					const p = picture;
					p._id = ObjectId.createFromHexString(picture._id);
					return p;
				});
				u.lastActiveAt = new Date(user.lastActiveAt);
				u.updatedAt = new Date(user.updatedAt);
				u.createdAt = new Date(user.createdAt);
				u.birthday = new Date(user.birthday);
				u.reports.psychology = ObjectId.createFromHexString(user.reports.psychology);
				u.reports.sexuality = ObjectId.createFromHexString(user.reports.sexuality);
				u.reports.loveLanguage = ObjectId.createFromHexString(user.reports.loveLanguage);
				u.reports.sociology = user.reports.sociology.map((reportSociology) =>
					ObjectId.createFromHexString(reportSociology),
				);
				return u;
			});
			await db.collection('users').insertMany(users);

			const data_chats = fs.readFileSync(path.resolve(__dirname, 'chats.json'));
			const docs_chats = JSON.parse(data_chats.toString());
			const chats = docs_chats.map((chat) => {
				const c = chat;
				c._id = ObjectId.createFromHexString(chat._id);
				c.conversation = ObjectId.createFromHexString(chat.conversation);
				c.destination = ObjectId.createFromHexString(chat.destination);
				c.sender = ObjectId.createFromHexString(chat.sender);
				c.createdAt = new Date(chat.createdAt);
				c.updatedAt = new Date(chat.updatedAt);
				if (chat.seenAt) {
					c.seenAt = new Date(chat.seenAt);
				}
				return c;
			});
			await db.collection('chats').insertMany(chats);

			const data_interactions = fs.readFileSync(path.resolve(__dirname, 'interactions.json'));
			const docs_interactions = JSON.parse(data_interactions.toString());
			const interactions = docs_interactions.map((interaction) => {
				const i = interaction;
				i._id = ObjectId.createFromHexString(interaction._id);
				i.seenAt = new Date(i.seenAt);
				i.user1 = ObjectId.createFromHexString(interaction.user1);
				i.user2 = ObjectId.createFromHexString(interaction.user2);
				i.sociologyReport = interaction.sociologyReport.map((sociology) => ObjectId.createFromHexString(sociology));
				i.compatibilityReport.user1Report.open = ObjectId.createFromHexString(
					interaction.compatibilityReport.user1Report.open,
				);
				i.compatibilityReport.user1Report.agree = ObjectId.createFromHexString(
					interaction.compatibilityReport.user1Report.agree,
				);
				i.compatibilityReport.user1Report.extro = ObjectId.createFromHexString(
					interaction.compatibilityReport.user1Report.extro,
				);
				i.compatibilityReport.user1Report.cons = ObjectId.createFromHexString(
					interaction.compatibilityReport.user1Report.cons,
				);
				i.compatibilityReport.user2Report.open = ObjectId.createFromHexString(
					interaction.compatibilityReport.user2Report.open,
				);
				i.compatibilityReport.user2Report.agree = ObjectId.createFromHexString(
					interaction.compatibilityReport.user2Report.agree,
				);
				i.compatibilityReport.user2Report.extro = ObjectId.createFromHexString(
					interaction.compatibilityReport.user2Report.extro,
				);
				i.compatibilityReport.user2Report.cons = ObjectId.createFromHexString(
					interaction.compatibilityReport.user2Report.cons,
				);
				return i;
			});
			await db.collection('interactions').insertMany(interactions);

			const data_conversations = fs.readFileSync(path.resolve(__dirname, 'conversations.json'));
			const docs_conversations = JSON.parse(data_conversations.toString());
			const conversations = docs_conversations.map((conversation) => {
				const conv = conversation;
				conv._id = ObjectId.createFromHexString(conversation._id);
				conv.user1 = ObjectId.createFromHexString(conversation.user1);
				conv.user2 = ObjectId.createFromHexString(conversation.user2);
				conv.match = ObjectId.createFromHexString(conversation.match);
				conv.latestMessage = ObjectId.createFromHexString(conversation.latestMessage);
				return conv;
			});
			await db.collection('conversations').insertMany(conversations);

			await client.close();

			options.uri += 'lovester';
			return options;
		},
	});
