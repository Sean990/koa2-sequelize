import config from '../config/config.js';
import { Forbidden } from '../utils/http-exception.js';

const buckets = new Map();

function getClientKey(ctx, keyPrefix) {
	const ip = ctx.ip || ctx.request.ip || ctx.get('x-forwarded-for') || 'unknown';
	return `${keyPrefix}:${ip}`;
}

export function rateLimit({
	windowMs = config.security.rateLimitWindowMs,
	max = config.security.rateLimitMax,
	keyPrefix = 'global',
} = {}) {
	return async (ctx, next) => {
		const now = Date.now();
		const key = getClientKey(ctx, keyPrefix);
		const bucket = buckets.get(key) || { count: 0, resetAt: now + windowMs };

		if (bucket.resetAt <= now) {
			bucket.count = 0;
			bucket.resetAt = now + windowMs;
		}

		bucket.count += 1;
		buckets.set(key, bucket);
		ctx.set('X-RateLimit-Limit', String(max));
		ctx.set('X-RateLimit-Remaining', String(Math.max(max - bucket.count, 0)));
		ctx.set('X-RateLimit-Reset', String(Math.ceil(bucket.resetAt / 1000)));

		if (bucket.count > max) {
			throw new Forbidden('请求过于频繁，请稍后再试');
		}

		await next();
	};
}
