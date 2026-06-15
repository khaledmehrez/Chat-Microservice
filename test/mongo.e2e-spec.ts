import { Test, TestingModule } from '@nestjs/testing';
import { ConfigModule } from '@nestjs/config';
import { FastifyAdapter, NestFastifyApplication } from '@nestjs/platform-fastify';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { MongoDriverService } from '../src/database/mongo-driver.service';
import * as winston from 'winston';
import { utilities as nestWinstonModuleUtilities, WinstonModule } from 'nest-winston';
import { DatabaseModule } from '../src/database/database.module';
import { MongoClient } from 'mongodb';
import { Types } from 'mongoose';
import { validateEnv } from '../src/env.validation';

jest.setTimeout(300000);

describe('Mongo (e2e)', () => {
	const user1 = {
		_id: new Types.ObjectId('62221be39537739e8674d940'),
		score: 0.5,
		popular: false,
	};

	const user2 = {
		_id: new Types.ObjectId('62221be39537739e8674d941'),
		score: 0.6,
		popular: false,
	};

	const user3 = {
		_id: new Types.ObjectId('62221be39537739e8674d942'),
		score: 0.7,
		popular: true,
	};

	let mongoDriverService: MongoDriverService;
	let mongod;
	let app: NestFastifyApplication;
	let db;

	beforeAll(async () => {
		mongod = await MongoMemoryServer.create();
		const moduleRef: TestingModule = await Test.createTestingModule({
			imports: [
				ConfigModule.forRoot({ isGlobal: true, envFilePath: './test/.env.test', validate: validateEnv }),
				DatabaseModule.register({ mongoURL: mongod.getUri() }),
				WinstonModule.forRoot({
					handleExceptions: true,
					transports: [
						new winston.transports.Console({
							format:
								process.env.DEBUG?.toString() === 'true'
									? winston.format.combine(
											winston.format.timestamp(),
											winston.format.ms(),
											winston.format.json(),
											nestWinstonModuleUtilities.format.nestLike('USER-MS', { prettyPrint: true }),
											winston.format.align(),
											winston.format.colorize({ all: true }),
									  )
									: winston.format.combine(winston.format.timestamp(), winston.format.ms(), winston.format.json()),
						}),
					],
				}),
			],
		}).compile();
		mongoDriverService = moduleRef.get<MongoDriverService>(MongoDriverService);
		app = moduleRef.createNestApplication<NestFastifyApplication>(new FastifyAdapter());
		await app.init();
		const client = await MongoClient.connect(mongod.getUri());
		db = client.db('lovester');
	});

	afterAll(async () => {
		await mongod.stop();
		app.close().then();
	});

	it('INSERT documents to db', async () => {
		await db.collection('users').insertOne(user1);
		await db.collection('users').insertOne(user2);
		await db.collection('users').insertOne(user3);
	});

	it('TEST FindOne', async () => {
		const x = await mongoDriverService.findOne('users', { _id: new Types.ObjectId('62221be39537739e8674d942') });
		expect(x).toBeTruthy();
		expect(x._id.toString()).toBe('62221be39537739e8674d942');
	});

	it('TEST AGGREGATION', async () => {
		const x = await mongoDriverService.aggregate('users', [
			{
				$match: {
					popular: false,
				},
			},
		]);
		expect(x).toBeTruthy();
		expect(x.length).toBe(2);
		expect(x[0]._id.toString()).toBe('62221be39537739e8674d940');
		expect(x[1]._id.toString()).toBe('62221be39537739e8674d941');
	});

	it('TEST FIND', async () => {
		const x = await mongoDriverService.find('users', { _id: new Types.ObjectId('62221be39537739e8674d940') });
		expect(x).toBeTruthy();
		expect(x.length).toBe(1);
		expect(x[0]._id.toString()).toBe('62221be39537739e8674d940');
	});
});
