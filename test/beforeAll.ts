import { Test, TestingModule } from '@nestjs/testing';
import { ExecutionContext, Injectable, Logger, ValidationPipe } from '@nestjs/common';
import { RequestInterceptor } from '../src/abstract/request.interceptor';
import { rootMongooseTestModule } from './test-utils/mongo/mongooseTestModule';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule } from '@nestjs/config';
import { FastifyAdapter, NestFastifyApplication } from '@nestjs/platform-fastify';
import fastifyCookie from 'fastify-cookie';
import fastifyHelmet from 'fastify-helmet';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { BullModule, getQueueToken } from '@nestjs/bull';
import { ChatModule } from '../src/chat/chat.module';
import { ConversationModule } from '../src/conversation/conversation.module';
import { ConversationService } from '../src/conversation/conversation.service';
import { ChatService } from '../src/chat/chat.service';
import { DatabaseModule } from '../src/database/database.module';
import { JobOptions } from 'bull';
import { WsGuard } from '../src/websocket-gateway/ws-jwt.guard';
import { WebsocketModule } from '../src/websocket-gateway/websocket.module';
import * as winston from 'winston';
import { utilities as nestWinstonModuleUtilities, WinstonModule } from 'nest-winston';
import { ConversationConsumer } from '../src/conversation/conversation.consumer';
import { JwtAuthGuard } from '../src/guards/jwt-auth.guard';
import { accessTokenUser1, accessTokenUser2 } from './variables';
import * as io from 'socket.io-client';

@Injectable()
export class BeforeAll {
	public mongod;
	public socketUser1;
	public socketUser2;
	public conversationConsumer;
	public app: NestFastifyApplication;
	public Id = '62221be39537739e8674d982';
	public conversationService: ConversationService;
	public chatService: ChatService;

	// eslint-disable-next-line @typescript-eslint/no-unused-vars,@typescript-eslint/no-empty-function
	public mockMatchQueue = jest.fn((_name: string, _data: any, _opts?: JobOptions) => {});
	// eslint-disable-next-line @typescript-eslint/no-unused-vars,@typescript-eslint/no-empty-function
	public mockNotificationQueue = jest.fn((_name: string, _data: any, _opts?: JobOptions) => {});
	// eslint-disable-next-line @typescript-eslint/no-unused-vars,@typescript-eslint/no-empty-function
	public mockChatQueue = jest.fn((_name: string, _data: any, _opts?: JobOptions) => {});

	public socketCall = jest.fn(() => {
		Logger.log('socket event called');
	});

	public notificationMsQueue = { add: this.mockNotificationQueue };
	public chatMsQueue = {
		add: this.mockChatQueue,
		process: {
			// eslint-disable-next-line @typescript-eslint/no-empty-function
			call: () => {},
		},
	};
	public matchMsQueue = { add: this.mockMatchQueue };

	async close() {
		if (this.socketUser1.connected) {
			this.socketUser1.disconnect();
		}
		if (this.socketUser2.connected) {
			this.socketUser2.disconnect();
		}
		await this.mongod.stop();
		await this.app.close();
	}

	async createApp() {
		this.mongod = await MongoMemoryServer.create();
		const moduleRef: TestingModule = await Test.createTestingModule({
			imports: [
				ConfigModule.forRoot({ isGlobal: true, envFilePath: './test/.env.test' }),
				DatabaseModule.register({ mongoURL: this.mongod.getUri() }),
				ChatModule,
				ConversationModule,
				BullModule.forRoot({
					redis: {
						host: 'localhost',
						port: 6379,
					},
				}),
				WinstonModule.forRoot({
					handleExceptions: true,
					transports: [
						new winston.transports.Console({
							format: winston.format.combine(
								winston.format.timestamp(),
								winston.format.ms(),
								winston.format.json(),
								nestWinstonModuleUtilities.format.nestLike('CHAT-MS', { prettyPrint: true }),
								winston.format.align(),
								winston.format.colorize({ all: true }),
							),
						}),
					],
				}),
				WebsocketModule,
				rootMongooseTestModule({ uri: this.mongod.getUri() }),
				JwtModule.register({
					secret: process.env.APP_SECRET,
					secretOrPrivateKey: process.env.APP_SECRET,
					signOptions: { expiresIn: '24h' },
				}),
			],
		})
			.overrideGuard(JwtAuthGuard)
			.useValue({
				canActivate: (context: ExecutionContext) => {
					const req = context.switchToHttp().getRequest();
					req.auth = { user: this.Id, roles: ['user'] };
					req.user = { user: this.Id, roles: ['user'] };
					return true;
				},
			})
			.overrideProvider(getQueueToken('match-ms'))
			.useValue(this.matchMsQueue)
			.overrideProvider(getQueueToken('notification-ms'))
			.useValue(this.notificationMsQueue)
			.overrideProvider(getQueueToken('chat-ms'))
			.useValue(this.chatMsQueue)
			.overrideGuard(WsGuard)
			.useValue({
				canActivate: (context: any) => {
					const handshake = context.switchToWs().getClient().handshake;
					context.switchToWs().getClient().handshake.auth = { user: handshake.auth.user };
					return true;
				},
			})
			.compile();

		this.app = moduleRef.createNestApplication<NestFastifyApplication>(new FastifyAdapter());
		this.conversationService = moduleRef.get<ConversationService>(ConversationService);
		this.conversationConsumer = moduleRef.get<ConversationConsumer>(ConversationConsumer);
		this.chatService = moduleRef.get<ChatService>(ChatService);
		this.app.useGlobalPipes(new ValidationPipe({ whitelist: true }));
		this.app.useGlobalInterceptors(new RequestInterceptor());
		await this.app.register(fastifyCookie, {
			secret: 'custom-cookies',
		});
		this.app.enableCors({ origin: process.env.ORIGIN, credentials: true });
		await this.app.register(fastifyHelmet, {
			contentSecurityPolicy: {
				directives: {
					defaultSrc: [`'self'`],
					styleSrc: [`'self'`, `'unsafe-inline'`],
					imgSrc: [`'self'`, 'data:', 'validator.swagger.io'],
					scriptSrc: [`'self'`, `https: 'unsafe-inline'`],
				},
			},
		});
		await this.app.init();

		this.socketUser1 = io.connect(`http://localhost:3010`, {
			transports: ['websocket'],
			path: '/chat-socket',
			secure: false,
			reconnection: true,
			rejectUnauthorized: true,
			auth: {
				token: accessTokenUser1,
				user: '62221be39537739e8674d981',
			},
		});

		this.socketUser2 = io.connect(`http://localhost:3010`, {
			transports: ['websocket'],
			path: '/chat-socket',
			secure: false,
			reconnection: true,
			rejectUnauthorized: true,
			auth: {
				token: accessTokenUser2,
				user: '62221be39537739e8674d982',
			},
		});

		return this.app;
	}
}
