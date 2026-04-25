import AuditLogModel from '../model/AuditLogModel.js';

const METHODS = new Set(['POST', 'PUT', 'PATCH', 'DELETE']);
const SENSITIVE_KEYS = new Set(['password', 'token', 'authorization']);

function sanitize(value) {
	if (!value || typeof value !== 'object') return value;
	if (Array.isArray(value)) return value.map(sanitize);
	const out = {};
	for (const [key, item] of Object.entries(value)) {
		out[key] = SENSITIVE_KEYS.has(key.toLowerCase()) ? '[已隐藏]' : sanitize(item);
	}
	return out;
}

export function auditLog() {
	return async (ctx, next) => {
		const start = Date.now();
		await next();
		if (!METHODS.has(ctx.method)) return;

		const body = JSON.stringify(sanitize(ctx.request.body || {})).slice(0, 4000);
		await AuditLogModel.createLog({
			user_id: ctx.state.user?.uid,
			username: ctx.state.user?.username,
			method: ctx.method,
			path: ctx.path,
			status: ctx.status,
			ip: ctx.ip || '',
			user_agent: ctx.get('user-agent') || '',
			request_body: body,
			response_code: ctx.body?.code || ctx.status,
			cost_ms: Date.now() - start,
		}).catch((err) => {
			console.error('[audit] write failed:', err.message);
		});
	};
}
