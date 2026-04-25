const isProduction = process.env.NODE_ENV === 'production';

export default {
	env: process.env.NODE_ENV || 'development',
	port: Number(process.env.PORT) || 3000,
	bodyLimit: process.env.BODY_LIMIT || '2mb',
	cors: {
		origin: process.env.CORS_ORIGIN || '*',
		credentials: process.env.CORS_CREDENTIALS === 'true',
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
