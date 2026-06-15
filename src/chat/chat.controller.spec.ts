import { Test, TestingModule } from '@nestjs/testing';
import { ChatControllerV0 } from './chat-v0.controller';

describe('ChatController', () => {
	let controller: ChatControllerV0;

	beforeEach(async () => {
		const module: TestingModule = await Test.createTestingModule({
			controllers: [ChatControllerV0],
		}).compile();

		controller = module.get<ChatControllerV0>(ChatControllerV0);
	});

	it('should be defined', () => {
		expect(controller).toBeDefined();
	});
});
