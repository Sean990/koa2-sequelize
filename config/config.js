import { existsSync } from 'node:fs';
import path from 'node:path';

export const projectRoot = path.join(import.meta.dirname, '..');

function resolveProjectPath(value) {
	return path.isAbsolute(value) ? value : path.join(projectRoot, value);
}

const envFile = path.join(projectRoot, '.env');

if (existsSync(envFile)) {
	if (typeof process.loadEnvFile !== 'function') {
		throw new Error('当前 Node.js 版本不支持 process.loadEnvFile，请升级 Node.js 或改用环境变量启动');
	}
	process.loadEnvFile(envFile);
}

const isProduction = process.env.NODE_ENV === 'production';

export default {
	env: process.env.NODE_ENV || 'development',
	port: Number(process.env.PORT) || 3000,
	bodyLimit: process.env.BODY_LIMIT || '2mb',
	appUrl: process.env.APP_URL || '',
	cors: {
		origin: process.env.CORS_ORIGIN || '*',
		credentials: process.env.CORS_CREDENTIALS === 'true',
	},
	security: {
		rateLimitWindowMs: Number(process.env.RATE_LIMIT_WINDOW_MS) || 60 * 1000,
		rateLimitMax: Number(process.env.RATE_LIMIT_MAX) || 120,
		loginFailureWindowMs: Number(process.env.LOGIN_FAILURE_WINDOW_MS) || 15 * 60 * 1000,
		loginFailureMax: Number(process.env.LOGIN_FAILURE_MAX) || 5,
		loginLockMs: Number(process.env.LOGIN_LOCK_MS) || 15 * 60 * 1000,
	},
	permissions: {
		admin: ['*'],
		editor: [
			'dashboard:read',
			'article:read',
			'article:write',
			'tag:read',
			'tag:write',
			'category:read',
			'category:write',
			'nav:read',
			'nav:write',
			'friend_link:read',
			'friend_link:write',
			'upload:write',
		],
		user: [],
	},
	upload: {
		dir: resolveProjectPath(process.env.UPLOAD_DIR || 'public/uploads'),
		urlPrefix: process.env.UPLOAD_URL_PREFIX || '/uploads',
		maxSize: Number(process.env.UPLOAD_MAX_SIZE) || 2 * 1024 * 1024,
		allowedMimes: (process.env.UPLOAD_ALLOWED_MIMES || 'image/jpeg,image/png,image/webp,image/gif')
			.split(',')
			.map((item) => item.trim())
			.filter(Boolean),
	},
	database: {
		dbName: process.env.DB_NAME || 'love_sql',
		host: process.env.DB_HOST || 'localhost',
		port: Number(process.env.DB_PORT) || 3306,
		user: process.env.DB_USER || 'root',
		password: process.env.DB_PASSWORD || 'root',
		logging: process.env.DB_LOGGING === 'true',
		syncAlter: process.env.DB_SYNC_ALTER
			? process.env.DB_SYNC_ALTER === 'true'
			: !isProduction,
	},
	jwt: {
		secret: process.env.JWT_SECRET || 'sean-blog-cms-dev-secret-change-me',
		expiresInSec: Number(process.env.JWT_EXPIRES_IN) || 60 * 60 * 24 * 7,
	},
	admin: {
		username: process.env.ADMIN_USERNAME || 'admin',
		password: process.env.ADMIN_PASSWORD || 'admin123456',
		nickname: process.env.ADMIN_NICKNAME || '系统管理员',
	},
};
