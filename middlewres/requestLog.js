import { appendFile, mkdir } from 'node:fs/promises';
import path from 'node:path';

async function appendLog(file, line) {
	const dir = path.dirname(file);
	await mkdir(dir, { recursive: true });
	await appendFile(file, `${line}\n`, 'utf8');
}

export function requestLog({ accessFile = 'logs/access.log', errorFile = 'logs/error.log' } = {}) {
	return async (ctx, next) => {
		const start = Date.now();
		try {
			await next();
			const line = JSON.stringify({
				time: new Date().toISOString(),
				method: ctx.method,
				path: ctx.path,
				status: ctx.status,
				cost_ms: Date.now() - start,
				ip: ctx.ip,
			});
			await appendLog(accessFile, line).catch(() => {});
		} catch (err) {
			const line = JSON.stringify({
				time: new Date().toISOString(),
				method: ctx.method,
				path: ctx.path,
				message: err.message,
				stack: err.stack,
				cost_ms: Date.now() - start,
			});
			await appendLog(errorFile, line).catch(() => {});
			throw err;
		}
	};
}
