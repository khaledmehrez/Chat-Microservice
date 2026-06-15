import { Db, Filter, FindOptions, AggregateOptions } from 'mongodb';
import { Global, Inject, Injectable, InternalServerErrorException } from '@nestjs/common';

@Global()
@Injectable()
export class MongoDriverService {
	constructor(@Inject('DATABASE_CONNECTION') private db: Db) {}

	async find(collection: string, filter: Filter<any>, options?: FindOptions): Promise<any> {
		try {
			return await this.db.collection(collection).find(filter, options).toArray();
		} catch (e) {
			throw new InternalServerErrorException(e);
		}
	}

	async findOne(collection: string, filter: Filter<any>, options?: FindOptions): Promise<any> {
		try {
			return await this.db.collection(collection).findOne(filter, options);
		} catch (e) {
			throw new InternalServerErrorException(e);
		}
	}

	async aggregate(collection: string, agg: any, options?: AggregateOptions): Promise<any> {
		try {
			return await this.db.collection(collection).aggregate(agg, options).toArray();
		} catch (e) {
			throw new InternalServerErrorException(e);
		}
	}
}
