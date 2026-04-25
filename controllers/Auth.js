import UserModel from '../model/UserModel.js';
import { hashPassword, isPasswordHash, verifyPassword } from '../utils/password.js';
import { signToken } from '../utils/jwt.js';
import { success } from '../utils/response.js';
import { AuthFailed, NotFound } from '../utils/http-exception.js';
import { requireString } from '../utils/validators.js';
import config from '../config/config.js';

class AuthController {
	static async login(ctx) {
		const body = ctx.request.body || {};
		const username = requireString(body, 'username', '用户名', { max: 32 });
		const password = requireString(body, 'password', '密码', { max: 128 });

		const user = await UserModel.findByUsername(username);
		if (!user) throw new AuthFailed('用户名或密码错误');

		const ok = await verifyPassword(password, user.password);
		if (!ok) throw new AuthFailed('用户名或密码错误');

		if (!isPasswordHash(user.password)) {
			await UserModel.updatePassword(user.id, await hashPassword(password));
		}

		const token = signToken(
			{ uid: user.id, username: user.username, role: user.role },
			config.jwt.secret,
			{ expiresInSec: config.jwt.expiresInSec }
		);

		success(ctx, {
			token,
			user: {
				id: user.id,
				username: user.username,
				nickname: user.nickname,
				avatar: user.avatar,
				role: user.role,
			},
		}, '登录成功');
	}

	static async me(ctx) {
		const uid = ctx.state.user?.uid;
		const user = await UserModel.getUserInfo(uid);
		if (!user) throw new NotFound('用户不存在');
		success(ctx, user, '查询成功');
	}
}

export default AuthController;
