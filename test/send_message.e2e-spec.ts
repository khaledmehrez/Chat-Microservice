import { Types } from 'mongoose';
import { BeforeAll } from './beforeAll';
import {
	accessToken,
	EmptyContent,
	EmptyConversation,
	EmptyDestination,
	InvalidConversation,
	InvalidDestination,
	Message,
	WrongConversation,
	WrongDestiantion,
} from './variables';
import { sleep } from './test-utils/utils';
import { delay } from '../src/utils/utils';

jest.setTimeout(300000);

describe('Chat (e2e)', () => {
	let app;
	let server: BeforeAll;
	beforeAll(async () => {
		server = new BeforeAll();
		app = await server.createApp();
	});

	afterAll(async () => {
		server.close().then();
	});

	it('waiting for socket to connect', (done) => {
		setTimeout(() => {
			done();
		}, 500);
	});

	it('typing state sync', async () => {
		server.socketUser2.on('typing', function (data) {
			server.socketCall();
			expect(data.content).toEqual('Hello');
			expect(data.destination).toEqual('62221be39537739e8674d982');
		});
		const data = {
			destination: '62221be39537739e8674d982',
			content: 'Hello',
		};
		await server.socketUser1.emit('send-typing', data);
		await sleep(500);
		expect(server.socketCall).toBeCalledTimes(1);
	});

	it('SEND MESSAGE', async () => {
		server.mockNotificationQueue.mockImplementation((name: string, data: any) => {
			expect(name).toEqual('message_notification');
			expect(data.user1).toBe('62221be39537739e8674d982');
			expect(data.user2).toBe('62221be39537739e8674d981');
		});

		server.socketUser1.on('new-message', function (data) {
			server.socketCall();
			expect(data.content).toEqual('Hello');
			expect(data.conversation).toEqual('622778951cf7097c0178c67c');
			expect(data.isDelivered).toEqual(false);
			expect(data.destination).toEqual('62221be39537739e8674d981');
			expect(data.sender).toEqual('62221be39537739e8674d982');
			expect(data.reactions.length).toEqual(0);
		});

		server.mockMatchQueue.mockImplementation((name: string, data: any) => {
			expect(name).toEqual('update-match-to-chat');
			expect(data.interactionId).toEqual(new Types.ObjectId('622777d43e18230e8fdf68c1'));
		});

		const res = await app.inject({
			method: 'POST',
			url: '/chat',
			headers: {
				'Content-Type': 'application/json',
				Authorization: `Bearer ${accessToken}`,
			},
			payload: Message,
		});
		const result = JSON.parse(res.body);
		const conversation = await server.conversationService.findById(new Types.ObjectId('622778951cf7097c0178c67c'));
		const ChatId = conversation.latestMessage.toString();
		const chat = await server.chatService.findById(new Types.ObjectId(`${ChatId}`));
		expect(server.mockMatchQueue).toBeCalled();
		expect(server.mockNotificationQueue).toBeCalled();
		expect(chat.content.toString()).toBe('Hello');
		expect(chat.destination.toString()).toBe('62221be39537739e8674d981');
		expect(chat.sender.toString()).toBe('62221be39537739e8674d982');
		expect(conversation.hasMessage).toBe(true);
		expect(res.statusCode).toBe(201);
		expect(result.message).toEqual('CREATED_MESSAGE');
		await delay(1000);
		await expect(server.socketCall).toBeCalledTimes(2);
	});

	it('SEND MESSAGE (EMPTY CONTENT)', async () => {
		const res = await app.inject({
			method: 'POST',
			url: '/chat',
			headers: {
				'Content-Type': 'application/json',
				Authorization: `Bearer ${accessToken}`,
			},
			payload: EmptyContent,
		});
		const result = JSON.parse(res.body);
		expect(res.statusCode).toBe(400);
		expect(result.message).toContain('content should not be empty');
		expect(result.error).toEqual('Bad Request');
	});

	it('SEND MESSAGE (INVALID DESTINATION ID)', async () => {
		const res = await app.inject({
			method: 'POST',
			url: '/chat',
			headers: {
				'Content-Type': 'application/json',
				Authorization: `Bearer ${accessToken}`,
			},
			payload: InvalidDestination,
		});
		const result = JSON.parse(res.body);
		expect(res.statusCode).toBe(400);
		expect(result.message).toContain('destination must be a mongodb id');
		expect(result.error).toEqual('Bad Request');
	});

	it('SEND MESSAGE (WRONG DESTINATION ID)', async () => {
		const res = await app.inject({
			method: 'POST',
			url: '/chat',
			headers: {
				'Content-Type': 'application/json',
				Authorization: `Bearer ${accessToken}`,
			},
			payload: WrongDestiantion,
		});
		const result = JSON.parse(res.body);
		expect(res.statusCode).toBe(404);
		expect(result.message).toEqual('CONVERSATION_NOT_FOUND');
		expect(result.error).toEqual('Not Found');
	});

	it('SEND MESSAGE (INVALID CONVERSATION ID)', async () => {
		const res = await app.inject({
			method: 'POST',
			url: '/chat',
			headers: {
				'Content-Type': 'application/json',
				Authorization: `Bearer ${accessToken}`,
			},
			payload: InvalidConversation,
		});
		const result = JSON.parse(res.body);
		expect(res.statusCode).toBe(400);
		expect(result.message).toContain('conversation must be a mongodb id');
		expect(result.error).toEqual('Bad Request');
	});

	it('SEND MESSAGE (WRONG CONVERSATION ID)', async () => {
		const res = await app.inject({
			method: 'POST',
			url: '/chat',
			headers: {
				'Content-Type': 'application/json',
				Authorization: `Bearer ${accessToken}`,
			},
			payload: WrongConversation,
		});
		const result = JSON.parse(res.body);
		expect(res.statusCode).toBe(404);
		expect(result.message).toEqual('CONVERSATION_NOT_FOUND');
		expect(result.error).toEqual('Not Found');
	});

	it('SEND MESSAGE (EMPTY DESTINATION ID)', async () => {
		const res = await app.inject({
			method: 'POST',
			url: '/chat',
			headers: {
				'Content-Type': 'application/json',
				Authorization: `Bearer ${accessToken}`,
			},
			payload: EmptyDestination,
		});
		const result = JSON.parse(res.body);
		expect(res.statusCode).toBe(400);
		expect(result.message).toContain('destination must be a mongodb id');
		expect(result.message).toContain('destination should not be empty');
		expect(result.error).toEqual('Bad Request');
	});

	it('SEND MESSAGE (EMPTY CONVERSATION ID)', async () => {
		const res = await app.inject({
			method: 'POST',
			url: '/chat',
			headers: {
				'Content-Type': 'application/json',
				Authorization: `Bearer ${accessToken}`,
			},
			payload: EmptyConversation,
		});
		const result = JSON.parse(res.body);
		expect(res.statusCode).toBe(400);
		expect(result.message).toContain('conversation must be a mongodb id');
		expect(result.message).toContain('conversation should not be empty');
		expect(result.error).toEqual('Bad Request');
	});

	it('SEND MESSAGE (with picture)', async () => {
		server.Id = '62221be39537739e8674d981';
		server.mockNotificationQueue.mockImplementation((name: string, data: any) => {
			expect(name).toEqual('message_notification');
			expect(data.user1).toBe('62221be39537739e8674d981');
			expect(data.user2).toBe('62221be39537739e8674d982');
		});

		server.socketUser2.on('new-message', function (data) {
			server.socketCall();
			expect(data.conversation).toEqual('622778951cf7097c0178c67d');
			expect(data.isDelivered).toEqual(false);
			expect(data.destination).toEqual('62221be39537739e8674d982');
			expect(data.sender).toEqual('62221be39537739e8674d981');
			expect(data.reactions.length).toEqual(0);
			expect(data.picture).toEqual(
				'https://lovester-backend-dev.s3.eu-central-1.amazonaws.com/id-verifications/16589363561548689.jpg',
			);
		});

		server.mockMatchQueue.mockImplementation((name: string, data: any) => {
			expect(name).toEqual('update-match-to-chat');
			expect(data.interactionId).toEqual(new Types.ObjectId('622777d43e18230e8fdf68c2'));
		});

		const res = await app.inject({
			method: 'POST',
			url: '/chat/send-picture',
			headers: {
				'Content-Type': 'application/json',
				Authorization: `Bearer ${accessToken}`,
			},
			payload: {
				picture: 'https://lovester-backend-dev.s3.eu-central-1.amazonaws.com/id-verifications/16589363561548689.jpg',
				destination: '62221be39537739e8674d982',
				sender: new Types.ObjectId(server.Id),
				conversation: '622778951cf7097c0178c67d',
			},
		});
		const result = JSON.parse(res.body);
		const conversation = await server.conversationService.findById(new Types.ObjectId('622778951cf7097c0178c67c'));
		const ChatId = conversation.latestMessage.toString();
		const chat = await server.chatService.findById(new Types.ObjectId(`${ChatId}`));
		expect(server.mockNotificationQueue).toBeCalledTimes(2);
		expect(server.mockMatchQueue).toBeCalledTimes(2);
		expect(chat.destination.toString()).toBe('62221be39537739e8674d981');
		expect(chat.sender.toString()).toBe('62221be39537739e8674d982');
		expect(conversation.hasMessage).toBe(true);
		expect(res.statusCode).toBe(201);
		expect(result.message).toEqual('CREATED_MESSAGE');
		await delay(1000);
		await expect(server.socketCall).toBeCalledTimes(3);
	});

	it('Test - existingConversation', async () => {
		const conversation = await server.conversationService.existingConversation(
			new Types.ObjectId('622778951cf7097c0178c67c'),
		);
		expect(conversation.user1.toString()).toBe('62221be39537739e8674d982');
		expect(conversation.user2.toString()).toBe('62221be39537739e8674d981');
		expect(conversation.match.toString()).toBe('622777d43e18230e8fdf68c1');
	});
});
