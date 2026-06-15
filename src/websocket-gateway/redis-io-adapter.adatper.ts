import { IoAdapter } from '@nestjs/platform-socket.io';
import { ServerOptions } from 'socket.io';
import { createAdapter } from '@socket.io/redis-adapter';
import { createClient } from 'redis';
import { INestApplicationContext } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

export class RedisIoAdapter extends IoAdapter {
	private adapterConstructor: ReturnType<typeof createAdapter>;

	constructor(private app: INestApplicationContext, private configService: ConfigService) {
		super(app);
	}

	async connectToRedis(): Promise<void> {
		const pubClient = createClient({
			url: `redis://${process.env.CHAT_REDIS_HOST}:${process.env.CHAT_REDIS_PORT}`,
			database: 0,
			name: process.env.CHAT_SENTINEL_NAME,
			password: process.env.CHAT_REDIS_PASSWORD,
		});
		pubClient.on('error', (err) => {
			// eslint-disable-next-line no-console
			console.log('pubClient', err, JSON.stringify(err));
		});
		const subClient = pubClient.duplicate();
		subClient.on('error', (err) => {
			// eslint-disable-next-line no-console
			console.log('subClient', err);
		});

		await Promise.all([pubClient.connect(), subClient.connect()]);

		this.adapterConstructor = createAdapter(pubClient, subClient);
	}

	createIOServer(port: number, options?: ServerOptions): any {
		port = this.configService.get<number>('WEBSOCKET_PORT');
		const server = super.createIOServer(port, options);
		server.adapter(this.adapterConstructor);
		return server;
	}
}
