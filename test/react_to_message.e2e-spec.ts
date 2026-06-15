import { Types } from 'mongoose';
import { BeforeAll } from './beforeAll';
import {
	accessToken,
	EmptyReaction,
	InvalidReaction,
	ReactInvalidMessageId,
	Reaction,
	ReactWrongMessageId,
} from './variables';

jest.setTimeout(300000);

describe('Chat - React to message (e2e)', () => {
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

	it('REACT TO A MESSAGE', async () => {
		server.socketUser1.on('message-reaction', function (data) {
			server.socketCall();
			expect(data.reactions.length).toBe(1);
			expect(data.reactions[0].reaction).toBe('LOVE');
			expect(data.reactions[0].userId).toBe('62221be39537739e8674d982');
		});

		server.socketUser2.on('message-reaction', function (data) {
			server.socketCall();
			expect(data.reactions.length).toBe(1);
			expect(data.reactions[0].reaction).toBe('LOVE');
			expect(data.reactions[0].userId).toBe('62221be39537739e8674d982');
		});

		const res = await app.inject({
			method: 'PATCH',
			url: '/chat/react',
			headers: {
				'Content-Type': 'application/json',
				Authorization: `Bearer ${accessToken}`,
			},
			payload: Reaction,
		});
		const result = JSON.parse(res.body);
		const chat = await server.chatService.findById(new Types.ObjectId('6218fa3ced69261e61d63dfd'));
		expect(chat.destination.toString()).toBe('62221be39537739e8674d982');
		expect(chat.sender.toString()).toBe('62221be39537739e8674d981');
		expect(chat.reactions[0].reaction).toBe('LOVE');
		expect(chat.reactions[0].userId.toString()).toBe('62221be39537739e8674d982');
		expect(res.statusCode).toBe(200);
		expect(result.message).toEqual('UPDATED_MESSAGE');
		expect(server.socketCall).toBeCalledTimes(2);
	});

	it('REACT TO A MESSAGE(from the other user)', async () => {
		server.socketUser1.removeAllListeners('message-reaction');
		server.socketUser2.removeAllListeners('message-reaction');
		server.Id = '62221be39537739e8674d981';

		server.socketUser1.on('message-reaction', function (data) {
			server.socketCall();
			expect(data.reactions.length).toBe(2);
			expect(data.reactions[1].reaction).toBe('LOVE');
			expect(data.reactions[1].userId).toBe('62221be39537739e8674d981');
		});

		server.socketUser2.on('message-reaction', function (data) {
			server.socketCall();
			expect(data.reactions.length).toBe(2);
			expect(data.reactions[1].reaction).toBe('LOVE');
			expect(data.reactions[1].userId).toBe('62221be39537739e8674d981');
		});

		const res = await app.inject({
			method: 'PATCH',
			url: '/chat/react',
			headers: {
				'Content-Type': 'application/json',
				Authorization: `Bearer ${accessToken}`,
			},
			payload: Reaction,
		});
		const result = JSON.parse(res.body);
		const chat = await server.chatService.findById(new Types.ObjectId('6218fa3ced69261e61d63dfd'));
		expect(chat.destination.toString()).toBe('62221be39537739e8674d982');
		expect(chat.sender.toString()).toBe('62221be39537739e8674d981');
		expect(chat.reactions[0].reaction).toBe('LOVE');
		expect(chat.reactions[0].userId.toString()).toBe('62221be39537739e8674d982');
		expect(res.statusCode).toBe(200);
		expect(result.message).toEqual('UPDATED_MESSAGE');
		expect(server.socketCall).toBeCalledTimes(4);
	});

	it('REACT TO A MESSAGE(INVALID REACTION)', async () => {
		server.Id = '62221be39537739e8674d982';
		const res = await app.inject({
			method: 'PATCH',
			url: '/chat/react',
			headers: {
				'Content-Type': 'application/json',
				Authorization: `Bearer ${accessToken}`,
			},
			payload: InvalidReaction,
		});
		const result = JSON.parse(res.body);
		expect(res.statusCode).toBe(400);
		expect(result.message[0]).toEqual('reaction must be a valid enum value');
		expect(result.error).toEqual('Bad Request');
	});

	it('REACT TO A MESSAGE(EMPTY REACTION)', async () => {
		const res = await app.inject({
			method: 'PATCH',
			url: '/chat/react',
			headers: {
				'Content-Type': 'application/json',
				Authorization: `Bearer ${accessToken}`,
			},
			payload: EmptyReaction,
		});
		const result = JSON.parse(res.body);
		expect(res.statusCode).toBe(400);
		expect(result.message).toContain('reaction must be a valid enum value');
		expect(result.message).toContain('reaction should not be empty');
		expect(result.error).toEqual('Bad Request');
	});

	it('REACT TO A MESSAGE(INVALID MESSAGE ID)', async () => {
		const res = await app.inject({
			method: 'PATCH',
			url: '/chat/react',
			headers: {
				'Content-Type': 'application/json',
				Authorization: `Bearer ${accessToken}`,
			},
			payload: ReactInvalidMessageId,
		});
		const result = JSON.parse(res.body);
		expect(res.statusCode).toBe(400);
		expect(result.message[0]).toEqual('messageId must be a mongodb id');
		expect(result.error).toEqual('Bad Request');
	});

	it('REACT TO A MESSAGE (WRONG MESSAGE ID)', async () => {
		const res = await app.inject({
			method: 'PATCH',
			url: '/chat/react',
			headers: {
				'Content-Type': 'application/json',
				Authorization: `Bearer ${accessToken}`,
			},
			payload: ReactWrongMessageId,
		});
		const result = JSON.parse(res.body);
		expect(res.statusCode).toBe(404);
		expect(result.message).toEqual('NOT_FOUND_MESSAGE');
		expect(result.error).toEqual('Not Found');
	});

	it('REACT TO A MESSAGE (SECOND TIME)', async () => {
		server.socketUser1.removeAllListeners('message-reaction');
		server.socketUser2.removeAllListeners('message-reaction');

		server.socketUser1.on('message-reaction', function (data) {
			server.socketCall();
			expect(data.reactions.length).toBe(1);
		});

		server.socketUser2.on('message-reaction', function (data) {
			server.socketCall();
			expect(data.reactions.length).toBe(1);
		});

		const res = await app.inject({
			method: 'PATCH',
			url: '/chat/react',
			headers: {
				'Content-Type': 'application/json',
				Authorization: `Bearer ${accessToken}`,
			},
			payload: Reaction,
		});
		const result = JSON.parse(res.body);
		const chat = await server.chatService.findById(new Types.ObjectId('6218fa3ced69261e61d63dfd'));
		expect(chat.destination.toString()).toBe('62221be39537739e8674d982');
		expect(chat.sender.toString()).toBe('62221be39537739e8674d981');
		expect(res.statusCode).toBe(200);
		expect(result.message).toEqual('UPDATED_MESSAGE');
		expect(server.socketCall).toBeCalledTimes(6);
	});
});
