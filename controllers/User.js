import UserModel from '../model/UserModel.js';
import { created, empty, success } from '../utils/response.js';
import { formatDate, toPlain } from '../utils/format.js';
import { hashPassword } from '../utils/password.js';
import {
	normalizeStatus,
	optionalString,
	pagination,
	positiveInt,
	requireString,
	validateRole,
} from '../utils/validators.js';
import { Existing, NotFound, ParameterException } from '../utils/http-exception.js';

function normalizeUser(item) {
	const data = item.toJSON ? item.toJSON() : item;
	data.create_time = formatDate(data.create_time);
	data.update_time = formatDate(data.update_time);
	return data;
}

function buildUserProfile(body, { partial = false, allowRole = false } = {}) {
	const payload = {};

	if (!partial || body.nickname !== undefined) {
		payload.nickname = requireString(body, 'nickname', '昵称', { max: 20 });
	}
	if (body.realname !== undefined) payload.realname = optionalString(body, 'realname', '真实姓名', { max: 20 }) || '';
	if (body.avatar !== undefined) payload.avatar = optionalString(body, 'avatar', '头像', { max: 255 }) || '';
	if (body.sex !== undefined) payload.sex = Number.parseInt(body.sex, 10) || 0;
	if (body.birthday !== undefined) payload.birthday = Number.parseInt(body.birthday, 10) || 0;
	if (body.github_nickname !== undefined) payload.github_nickname = optionalString(body, 'github_nickname', 'GitHub 昵称', { max: 255 }) || '';
	if (body.github_link !== undefined) payload.github_link = optionalString(body, 'github_link', 'GitHub 链接', { max: 255 }) || '';
	if (body.qq_nickname !== undefined) payload.qq_nickname = optionalString(body, 'qq_nickname', 'QQ 昵称', { max: 255 }) || '';
	if (body.qq_link !== undefined) payload.qq_link = optionalString(body, 'qq_link', 'QQ 链接', { max: 255 }) || '';
	if (body.music_nickname !== undefined) payload.music_nickname = optionalString(body, 'music_nickname', '音乐账号昵称', { max: 255 }) || '';
	if (body.music_link !== undefined) payload.music_link = optionalString(body, 'music_link', '音乐账号链接', { max: 255 }) || '';
	if (allowRole && body.role !== undefined) payload.role = validateRole(body.role);
	if (allowRole && body.status !== undefined) payload.status = normalizeStatus(body.status);

	return payload;
}

class UserController {
	static async UserList(ctx) {
		const { page, pageSize } = pagination(ctx.query);
		const raw = await UserModel.getUserList({ page, pageSize, keyword: ctx.query.keyword });
		const data = {
			...raw,
			rows: toPlain(raw.rows).map(normalizeUser),
		};
		success(ctx, data, '查询成功');
	}

	static async UserInfo(ctx) {
		const id = positiveInt(ctx.query.id, '用户ID');
		const user = await UserModel.getUserInfo(id);
		if (!user) throw new NotFound('用户不存在');
		success(ctx, normalizeUser(toPlain(user)), '查询成功');
	}

	static async adminList(ctx) {
		const { page, pageSize } = pagination(ctx.query);
		const raw = await UserModel.getUserList({
			page,
			pageSize,
			keyword: ctx.query.keyword,
			includeDisabled: true,
		});
		const data = {
			...raw,
			rows: toPlain(raw.rows).map(normalizeUser),
		};
		success(ctx, data, '查询成功');
	}

	static async create(ctx) {
		const body = ctx.request.body || {};
		const username = requireString(body, 'username', '用户名', { max: 32 });
		const password = requireString(body, 'password', '密码', { min: 6, max: 128 });
		const existing = await UserModel.findAnyByUsername(username);
		if (existing) throw new Existing('用户名已存在');

		const profile = buildUserProfile({
			...body,
			nickname: body.nickname || username,
		}, { allowRole: true });
		const user = await UserModel.createUser({
			...profile,
			username,
			password: await hashPassword(password),
			role: validateRole(body.role),
		});
		created(ctx, { id: user.id }, '创建用户成功');
	}

	static async update(ctx) {
		const id = positiveInt(ctx.params.id, '用户ID');
		const payload = buildUserProfile(ctx.request.body || {}, { partial: true, allowRole: true });
		if (Object.keys(payload).length === 0) throw new ParameterException('没有可更新的内容');
		const [affected] = await UserModel.updateUser(id, payload);
		if (!affected) throw new NotFound('用户不存在');
		empty(ctx, '更新成功');
	}

	static async updatePassword(ctx) {
		const id = positiveInt(ctx.params.id, '用户ID');
		const password = requireString(ctx.request.body || {}, 'password', '新密码', { min: 6, max: 128 });
		const [affected] = await UserModel.updatePassword(id, await hashPassword(password));
		if (!affected) throw new NotFound('用户不存在');
		empty(ctx, '密码已更新');
	}

	static async remove(ctx) {
		const id = positiveInt(ctx.params.id, '用户ID');
		if (id === ctx.state.user?.uid) throw new ParameterException('不能删除当前登录用户');
		const [affected] = await UserModel.deleteUser(id);
		if (!affected) throw new NotFound('用户不存在');
		empty(ctx, '删除成功');
	}
}

export default UserController;
