import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ChatModule } from './chat/chat.module';
import { PassportModule } from '@nestjs/passport';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { JwtStrategy } from './guards/jwt.strategy';
import { WebsocketModule } from './websocket-gateway/websocket.module';
import { ConversationModule } from './conversation/conversation.module';
import { DatabaseModule } from './database/database.module';
import { BullModule } from '@nestjs/bull';
import * as winston from 'winston';
import { utilities as nestWinstonModuleUtilities, WinstonModule } from 'nest-winston';
import { validateEnv } from './env.validation';

@Module({
	imports: [
		ConfigModule.forRoot({ validate: validateEnv, isGlobal: true }),
		WinstonModule.forRoot({
			handleExceptions: true,
			transports: [
				new winston.transports.Console({
					format:
						process.env.DEBUG?.toString() === 'true'
							? winston.format.combine(
									winston.format.timestamp(),
									winston.format.json(),
									winston.format.ms(),
									nestWinstonModuleUtilities.format.nestLike('CHAT-MS', { prettyPrint: true }),
									winston.format.align(),
									winston.format.colorize({ all: true }),
							  )
							: winston.format.combine(winston.format.timestamp(), winston.format.ms(), winston.format.json()),
				}),
			],
		}),
		PassportModule,
		JwtModule.register({
			secret: process.env.JWT_ACCESS_TOKEN_SECRET,
			signOptions: { expiresIn: process.env.JWT_ACCESS_TOKEN_EXPIRATION_TIME },
		}),
		MongooseModule.forRoot(process.env.MONGO_URL, {
			maxPoolSize: 300,
		}),
		BullModule.forRoot({
			redis: {
				host: process.env.BULL_REDIS_HOST,
				port: parseInt(process.env.BULL_REDIS_PORT),
				password: process.env.BULL_REDIS_PASSWORD,
				sentinels: process.env.BULL_SENTINEL_HOST
					? [
							{
								host: process.env.BULL_SENTINEL_HOST,
								port: parseInt(process.env.BULL_SENTINEL_PORT),
							},
					  ]
					: undefined,
				sentinelPassword: process.env.BULL_SENTINEL_PASSWORD,
				name: process.env.BULL_SENTINEL_NAME,
			},
		}),
		DatabaseModule.register({ mongoURL: process.env.MONGO_SERVER_URL }),
		ChatModule,
		ConversationModule,
		WebsocketModule,
	],
	controllers: [AppController],
	providers: [AppService, JwtStrategy],
})
export class AppModule {}
