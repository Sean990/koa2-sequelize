import UserModel from '../model/UserModel.js';
import { hashPassword, isPasswordHash } from '../utils/password.js';
import config from '../config/config.js';

export async function ensureAdminUser() {
	const { username, password, nickname } = config.admin;

	if (config.env === 'production') {
		if (!process.env.JWT_SECRET) {
			throw new Error('生产环境必须配置 JWT_SECRET');
		}
		if (!process.env.ADMIN_PASSWORD) {
			throw new Error('生产环境必须配置 ADMIN_PASSWORD');
		}
	}

	const existing = await UserModel.findAnyByUsername(username);
	if (existing) {
		const patch = {};
		if (existing.status !== 1) patch.status = 1;
		if (existing.role !== 'admin') patch.role = 'admin';
		if (Object.keys(patch).length > 0) {
			await UserModel.updateUser(existing.id, patch);
			console.log(`[bootstrap] admin user "${username}" role/status repaired.`);
		}
		if (!isPasswordHash(existing.password)) {
			await UserModel.updatePassword(existing.id, await hashPassword(existing.password));
			console.log(`[bootstrap] admin user "${username}" password migrated to hash.`);
		}
		console.log(`[bootstrap] admin user "${username}" already exists, skip.`);
		return existing;
	}

	if (!process.env.ADMIN_PASSWORD) {
		console.warn('[bootstrap] 当前使用默认管理员密码，请在部署前配置 ADMIN_PASSWORD。');
	}

	const user = await UserModel.createUser({
		username,
		nickname: nickname || username,
		password: await hashPassword(password),
		role: 'admin',
	});
	console.log(`[bootstrap] created default admin user "${username}" (id=${user.id}).`);
	return user;
}
