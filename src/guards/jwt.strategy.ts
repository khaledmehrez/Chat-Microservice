import { ExtractJwt, Strategy } from 'passport-jwt';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { env } from 'process';
import { PassportStrategy } from '@nestjs/passport';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
	constructor() {
		super({
			jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
			ignoreExpiration: true,
			secretOrKey: env.JWT_ACCESS_TOKEN_SECRET,
		});
	}

	async validate(payload: any) {
		if (payload.exp > Date.now()) {
			throw new UnauthorizedException();
		} else {
			delete payload.exp;
			delete payload.iat;

			return payload;
		}
	}
}
