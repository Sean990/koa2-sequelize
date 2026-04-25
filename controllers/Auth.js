import UserModel from '../model/UserModel.js';
import { hashPassword, isPasswordHash, verifyPassword } from '../utils/password.js';
import { signToken } from '../utils/jwt.js';
import { success } from '../utils/response.js';
import { AuthFailed, NotFound } from '../utils/http-exception.js';
import { requireString } from '../utils/validators.js';
import config from '../config/config.js';
import { hasPermission } from '../middlewres/auth.js';

const loginFailures = new Map();

function loginKey(ctx, username) {
	const ip = ctx.ip || ctx.request.ip || ctx.get('x-forwarded-for') || 'unknown';
	return `${username}:${ip}`;
}

function assertLoginAllowed(ctx, username) {
	const key = loginKey(ctx, username);
	const record = loginFailures.get(key);
	if (!record) return;
	const now = Date.now();
	if (record.lockUntil && record.lockUntil > now) {
		throw new AuthFailed('登录失败次数过多，请稍后再试');
	}
	if (record.expiresAt <= now) {
		loginFailures.delete(key);
	}
}

function recordLoginFailure(ctx, username) {
	const key = loginKey(ctx, username);
	const now = Date.now();
	const record = loginFailures.get(key) || {
		count: 0,
		expiresAt: now + config.security.loginFailureWindowMs,
		lockUntil: 0,
	};
	if (record.expiresAt <= now) {
		record.count = 0;
		record.expiresAt = now + config.security.loginFailureWindowMs;
		record.lockUntil = 0;
	}
	record.count += 1;
	if (record.count >= config.security.loginFailureMax) {
		record.lockUntil = now + config.security.loginLockMs;
	}
	loginFailures.set(key, record);
}

function clearLoginFailure(ctx, username) {
	loginFailures.delete(loginKey(ctx, username));
}

function buildToken(user) {
	return signToken(
		{ uid: user.id, username: user.username, role: user.role },
		config.jwt.secret,
		{ expiresInSec: config.jwt.expiresInSec }
	);
}

class AuthController {
	static async login(ctx) {
		const body = ctx.request.body || {};
		const username = requireString(body, 'username', '用户名', { max: 32 });
		const password = requireString(body, 'password', '密码', { max: 128 });
		assertLoginAllowed(ctx, username);

		const user = await UserModel.findByUsername(username);
		if (!user) {
			recordLoginFailure(ctx, username);
			throw new AuthFailed('用户名或密码错误');
		}

		const ok = await verifyPassword(password, user.password);
		if (!ok) {
			recordLoginFailure(ctx, username);
			throw new AuthFailed('用户名或密码错误');
		}
		clearLoginFailure(ctx, username);

		if (!isPasswordHash(user.password)) {
			await UserModel.updatePassword(user.id, await hashPassword(password));
		}

		const token = buildToken(user);

		success(ctx, {
			token,
			user: {
				id: user.id,
				username: user.username,
				nickname: user.nickname,
				avatar: user.avatar,
				role: user.role,
				permissions: config.permissions[user.role] || [],
			},
		}, '登录成功');
	}

	static async me(ctx) {
		const uid = ctx.state.user?.uid;
		const user = await UserModel.getUserInfo(uid);
		if (!user) throw new NotFound('用户不存在');
		const data = user.toJSON ? user.toJSON() : user;
		data.permissions = config.permissions[data.role] || [];
		success(ctx, data, '查询成功');
	}

	static async refresh(ctx) {
		const uid = ctx.state.user?.uid;
		const user = await UserModel.raw.findOne({ where: { id: uid, status: 1 } });
		if (!user) throw new NotFound('用户不存在');
		success(ctx, {
			token: buildToken(user),
		}, '刷新成功');
	}

	static async permissions(ctx) {
		const role = ctx.state.user?.role;
		const permission = ctx.query.permission;
		success(ctx, {
			role,
			permissions: config.permissions[role] || [],
			all: config.permissions,
			can: permission ? hasPermission(role, permission) : undefined,
		}, '查询成功');
	}
}

export default AuthController;
