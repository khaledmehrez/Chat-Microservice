import { Types } from 'mongoose';
import { BeforeAll } from './beforeAll';
import { accessToken, Chat } from './variables';

jest.setTimeout(300000);

describe('Chat - Mark message as seen (e2e)', () => {
	let app;
	const Id = '62221be39537739e8674d982';
	let server: BeforeAll;

	beforeAll(async () => {
		server = new BeforeAll();
		app = await server.createApp();
	});

	afterAll(() => {
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

	it('MARK A MESSAGE AS SEEN', async () => {
		server.socketUser1.on('message-seen', function (data) {
			server.socketCall();
			expect(data[0]._id).toEqual('6218fa3ced69261e61d63dfe');
			expect(data[1]._id).toEqual('6218fa3ced69261e61d63eaf');
			expect(data[2]._id).toEqual('6218fa3ced69261e61d63eae');
			expect(data[3]._id).toEqual('6218fa3ced69261e61d63eaa');
			expect(data[4]._id).toEqual('6218fa3ced69261e61d63eab');
			expect(data[5]._id).toEqual('6218fa3ced69261e61d63eac');
			expect(data[6]._id).toEqual('6218fa3ced69261e61d63ead');
			expect(data[0].conversation).toEqual('622778951cf7097c0178c67c');
			expect(data[0].destination).toEqual('62221be39537739e8674d982');
			expect(data[0].sender).toEqual('62221be39537739e8674d981');
			expect(data[0].reactions.length).toEqual(0);
		});

		server.socketUser2.on('message-seen', function (data) {
			server.socketCall();
			expect(data[0]._id).toEqual('6218fa3ced69261e61d63dfe');
			expect(data[1]._id).toEqual('6218fa3ced69261e61d63eaf');
			expect(data[2]._id).toEqual('6218fa3ced69261e61d63eae');
			expect(data[3]._id).toEqual('6218fa3ced69261e61d63eaa');
			expect(data[4]._id).toEqual('6218fa3ced69261e61d63eab');
			expect(data[5]._id).toEqual('6218fa3ced69261e61d63eac');
			expect(data[6]._id).toEqual('6218fa3ced69261e61d63ead');
			expect(data[0].conversation).toEqual('622778951cf7097c0178c67c');
			expect(data[0].destination).toEqual('62221be39537739e8674d982');
			expect(data[0].sender).toEqual('62221be39537739e8674d981');
			expect(data[0].reactions.length).toEqual(0);
		});

		const res = await app.inject({
			method: 'PATCH',
			url: '/chat/mark-as-seen',
			headers: {
				'Content-Type': 'application/json',
				Authorization: `Bearer ${accessToken}`,
			},
			payload: { date: new Date(), conversation: new Types.ObjectId('622778951cf7097c0178c67c') },
		});
		const result = JSON.parse(res.body);
		const chats = await server.chatService.find({ conversation: new Types.ObjectId(Chat.conversation) });
		chats.forEach((value) => {
			if (value._id.toString() == Chat.message) {
				expect(Date.now() - value.seenAt.getTime()).toBeLessThanOrEqual(1000);
			} else if (value._id.toString() == '6218fa3ced69261e61d63dfd') {
				expect(value.seenAt.toISOString()).toBe('2022-02-28T16:39:33.805Z');
			} else if (value.destination.toString() == Id) {
				expect(Date.now() - value.seenAt.getTime()).toBeLessThanOrEqual(1000);
			} else {
				expect(value.seenAt).toBeUndefined();
			}
		});
		const chat = await server.chatService.findById(new Types.ObjectId('6218fa3ced69261e61d63eae'));
		expect(chat.destination.toString()).toBe('62221be39537739e8674d982');
		expect(chat.sender.toString()).toBe('62221be39537739e8674d981');
		expect(Date.now() - chat.seenAt.getTime()).toBeLessThanOrEqual(1000);
		expect(chat.isDelivered).toBe(true);
		expect(res.statusCode).toBe(200);
		expect(result.message).toEqual('UPDATED_MESSAGE');
		expect(server.socketCall).toBeCalledTimes(2);
	});

	it('MARK A MESSAGE AS SEEN(EMPTY date)', async () => {
		const res = await app.inject({
			method: 'PATCH',
			url: '/chat/mark-as-seen',
			headers: {
				'Content-Type': 'application/json',
				Authorization: `Bearer ${accessToken}`,
			},
			payload: { date: '', conversation: new Types.ObjectId('622778951cf7097c0178c67c') },
		});
		const result = JSON.parse(res.body);
		expect(res.statusCode).toBe(400);
		expect(result.message).toContain('date must be a valid ISO 8601 date string');
		expect(result.message).toContain('date should not be empty');
		expect(result.error).toEqual('Bad Request');
	});

	it('MARK A MESSAGE AS SEEN(EMPTY CONVERSATION ID)', async () => {
		const res = await app.inject({
			method: 'PATCH',
			url: '/chat/mark-as-seen',
			headers: {
				'Content-Type': 'application/json',
				Authorization: `Bearer ${accessToken}`,
			},
			payload: { date: new Date(), conversation: '' },
		});
		const result = JSON.parse(res.body);
		expect(res.statusCode).toBe(400);
		expect(result.message).toContain('conversation must be a mongodb id');
		expect(result.message).toContain('conversation should not be empty');
		expect(result.error).toEqual('Bad Request');
	});
});
