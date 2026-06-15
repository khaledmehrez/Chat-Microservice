import { Types } from 'mongoose';
import { BeforeAll } from './beforeAll';
import { accessToken, Conversation, ConversationId, WrongConvId } from './variables';

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
	it('waiting for socket to connect', (done) => {
		setTimeout(() => {
			done();
		}, 500);
	});

	it('GET A CONVERSATION', async () => {
		const res = await app.inject({
			method: 'GET',
			url: '/conversation?skip=0&limit=10',
			headers: {
				'Content-Type': 'application/json',
				Authorization: `Bearer ${accessToken}`,
			},
		});
		const result = JSON.parse(res.body);

		expect(res.statusCode).toBe(200);
		expect(result.message).toEqual('FOUND_CONVERSATIONS');
	});

	it('GET ALL MESSAGES OF A CONVERSATION', async () => {
		const res = await app.inject({
			method: 'GET',
			url: `/chat/by-conversation/${ConversationId}?skip=0&limit=10`,
			headers: {
				'Content-Type': 'application/json',
				Authorization: `Bearer ${accessToken}`,
			},
		});

		const result = JSON.parse(res.body);
		const chats = await server.chatService.find({
			conversation: new Types.ObjectId('622778951cf7097c0178c67c'),
		});
		expect(res.statusCode).toBe(200);
		expect(result.data.length).toBe(chats.length);
		expect(result.message).toEqual('FOUND_MESSAGES');
	});

	it('GET A CONVERSATION (WRONG CONVERSATION ID)', async () => {
		const res = await app.inject({
			method: 'GET',
			url: `/chat/by-conversation/${WrongConvId}?skip=0&limit=10`,
			headers: {
				'Content-Type': 'application/json',
				Authorization: `Bearer ${accessToken}`,
			},
		});
		const result = JSON.parse(res.body);
		expect(res.statusCode).toBe(200);
		expect(result.data.length).toBe(0);
		expect(result.message).toEqual('FOUND_MESSAGES');
	});

	it('ADD A CONVERSATION)', async () => {
		const res = await app.inject({
			method: 'POST',
			url: 'conversation',
			headers: {
				'Content-Type': 'application/json',
				Authorization: `Bearer ${accessToken}`,
			},
			payload: Conversation,
		});
		const result = JSON.parse(res.body);
		const d = result.data._id;
		const conversation = await server.conversationService.findById(new Types.ObjectId(`${d}`));
		expect(conversation.user1.toString()).toBe('62221be39537739e8674d982');
		expect(conversation.user2.toString()).toBe('62221be39537739e8674d980');
		expect(conversation.match.toString()).toBe('622777d43e18230e8fdf68c1');
		expect(res.statusCode).toBe(201);
		expect(result.message).toEqual('CREATED_CONVERSATION');
	});

	it('Exclude Conversation', async () => {
		const job: any = {
			data: {
				interactionId: [new Types.ObjectId('622777d43e18230e8fdf68c1')],
			},
		};
		await server.conversationConsumer.excludeConversation(job);
		const conversation = await server.conversationService.findById(new Types.ObjectId('622778951cf7097c0178c67c'));
		expect(conversation.isExcluded).toBe(true);
	});

	it('TEST findByIdAndDelete', async () => {
		await server.chatService.findByIdAndDelete(new Types.ObjectId('6218fa3ced69261e61d63eaa'));
		const x = await server.chatService.find({ _id: '6218fa3ced69261e61d63eaa' });
		expect(x.length).toBe(0);
	});

	it('TEST findOneAndDelete', async () => {
		await server.chatService.findOneAndDelete({ _id: '6218fa3ced69261e61d63eab' });
		const x = await server.chatService.find({ _id: '6218fa3ced69261e61d63eab' });
		expect(x.length).toBe(0);
	});

	it('TEST deleteMany', async () => {
		await server.chatService.deleteMany({ _id: ['6218fa3ced69261e61d63eac', '6218fa3ced69261e61d63ead'] });
		const x = await server.chatService.find({ _id: '6218fa3ced69261e61d63eac' });
		const y = await server.chatService.find({ _id: '6218fa3ced69261e61d63ead' });
		expect(x.length).toBe(0);
		expect(y.length).toBe(0);
	});
});
