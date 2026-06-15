import { Types } from 'mongoose';
import { BeforeAll } from './beforeAll';
import {
	accessToken,
	Chat,
	EmptyConversationId,
	EmptyMessageId,
	InvalidConversationId,
	InvalidMessageId,
	WrongConversationId,
	WrongMessageId,
} from './variables';

jest.setTimeout(300000);

describe('Chat - Mark message as delivered (e2e)', () => {
	let app;
	const Id = '62221be39537739e8674d982';
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

	it('waiting for socket to connect', (done) => {
		setTimeout(() => {
			done();
		}, 500);
	});

	it('MARK A MESSAGE AS DELIVERED', async () => {
		server.socketUser1.on('message-delivered', function (data) {
			server.socketCall();
			expect(data.content).toEqual('cccdcllc');
			expect(data.conversation).toEqual('622778951cf7097c0178c67c');
			expect(data.isDelivered).toEqual(true);
			expect(data.destination).toEqual('62221be39537739e8674d982');
			expect(data.sender).toEqual('62221be39537739e8674d981');
			expect(data.reactions.length).toEqual(0);
		});

		server.socketUser2.on('message-delivered', function (data) {
			server.socketCall();
			expect(data.content).toEqual('cccdcllc');
			expect(data.conversation).toEqual('622778951cf7097c0178c67c');
			expect(data.isDelivered).toEqual(true);
			expect(data.destination).toEqual('62221be39537739e8674d982');
			expect(data.sender).toEqual('62221be39537739e8674d981');
			expect(data.reactions.length).toEqual(0);
		});

		const res = await app.inject({
			method: 'PATCH',
			url: '/chat/mark-as-delivered',
			headers: {
				'Content-Type': 'application/json',
				Authorization: `Bearer ${accessToken}`,
			},
			payload: Chat,
		});

		const result = JSON.parse(res.body);
		expect(res.statusCode).toBe(200);
		expect(result.message).toEqual('UPDATED_MESSAGE');
		const chats = await server.chatService.find({ conversation: new Types.ObjectId('622778951cf7097c0178c67c') });

		for (const chat of chats) {
			if (chat._id.toString() <= Chat.message && chat.destination.toString() == Id) {
				expect(chat.isDelivered).toBe(true);
			} else {
				expect(chat.isDelivered).toBe(false);
			}
		}

		await new Promise((f) => setTimeout(f, 500));
		expect(server.socketCall).toBeCalledTimes(2);
	});

	it('MARK A MESSAGE AS DELIVERED(INVALID MESSAGE ID)', async () => {
		const res = await app.inject({
			method: 'PATCH',
			url: '/chat/mark-as-delivered',
			headers: {
				'Content-Type': 'application/json',
				Authorization: `Bearer ${accessToken}`,
			},
			payload: InvalidMessageId,
		});
		const result = JSON.parse(res.body);
		expect(res.statusCode).toBe(400);
		expect(result.message[0]).toEqual('message must be a mongodb id');
		expect(result.error).toEqual('Bad Request');
	});

	it('MARK A MESSAGE AS DELIVERED(WRONG MESSAGE ID)', async () => {
		const res = await app.inject({
			method: 'PATCH',
			url: '/chat/mark-as-delivered',
			headers: {
				'Content-Type': 'application/json',
				Authorization: `Bearer ${accessToken}`,
			},
			payload: WrongMessageId,
		});
		const result = JSON.parse(res.body);
		expect(res.statusCode).toBe(404);
		expect(result.message).toEqual(`NOT_FOUND_MESSAGE`);
		expect(result.error).toEqual('Not Found');
	});

	it('MARK A MESSAGE AS DELIVERED(EMPTY MESSAGE ID)', async () => {
		const res = await app.inject({
			method: 'PATCH',
			url: '/chat/mark-as-delivered',
			headers: {
				'Content-Type': 'application/json',
				Authorization: `Bearer ${accessToken}`,
			},
			payload: EmptyMessageId,
		});
		const result = JSON.parse(res.body);
		expect(res.statusCode).toBe(400);
		expect(result.message).toContain('message must be a mongodb id');
		expect(result.message).toContain('message should not be empty');
		expect(result.error).toEqual('Bad Request');
	});

	it('MARK A MESSAGE AS DELIVERED(INVALID CONVERSATION ID)', async () => {
		const res = await app.inject({
			method: 'PATCH',
			url: '/chat/mark-as-delivered',
			headers: {
				'Content-Type': 'application/json',
				Authorization: `Bearer ${accessToken}`,
			},
			payload: InvalidConversationId,
		});
		const result = JSON.parse(res.body);
		expect(res.statusCode).toBe(400);
		expect(result.message[0]).toEqual('conversation must be a mongodb id');
		expect(result.error).toEqual('Bad Request');
	});

	it('MARK A MESSAGE AS DELIVERED (WRONG CONVERSATION ID)', async () => {
		const res = await app.inject({
			method: 'PATCH',
			url: '/chat/mark-as-delivered',
			headers: {
				'Content-Type': 'application/json',
				Authorization: `Bearer ${accessToken}`,
			},
			payload: WrongConversationId,
		});
		const result = JSON.parse(res.body);
		expect(res.statusCode).toBe(404);
		expect(result.message).toEqual('NOT_FOUND_MESSAGE');
		expect(result.error).toEqual('Not Found');
	});

	it('MARK A MESSAGE AS DELIVERED(EMPTY CONVERSATION ID)', async () => {
		const res = await app.inject({
			method: 'PATCH',
			url: '/chat/mark-as-delivered',
			headers: {
				'Content-Type': 'application/json',
				Authorization: `Bearer ${accessToken}`,
			},
			payload: EmptyConversationId,
		});
		const result = JSON.parse(res.body);
		expect(res.statusCode).toBe(400);
		expect(result.message).toContain('conversation must be a mongodb id');
		expect(result.message).toContain('conversation should not be empty');
		expect(result.error).toEqual('Bad Request');
	});
});
