import { verifyToken } from '../utils/jwt.js';
import config from '../config/config.js';
import { AuthFailed, Forbidden } from '../utils/http-exception.js';

export function auth() {
	return async (ctx, next) => {
		const header = ctx.request.headers.authorization || '';
		const token = header.startsWith('Bearer ') ? header.slice(7) : '';
		const payload = verifyToken(token, config.jwt.secret);
		if (!payload) {
			throw new AuthFailed('登录已失效，请重新登录');
		}
		ctx.state.user = payload;
		await next();
	};
}

export function requireRole(...roles) {
	return async (ctx, next) => {
		const role = ctx.state.user?.role;
		if (!roles.includes(role)) {
			throw new Forbidden('权限不足');
		}
		await next();
	};
}
