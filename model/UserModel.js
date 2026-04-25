import { DataTypes, Op } from 'sequelize';
import { sequelize } from '../config/db.js';
import cmsUser from '../schema/cms_user.js';
import { now } from '../utils/format.js';

const User = cmsUser(sequelize, DataTypes);

const SAFE_ATTRS_EXCLUDE = ['realname', 'password'];
const ADMIN_SAFE_EXCLUDE = ['password'];

class UserModel {
	static get raw() {
		return User;
	}

	static async createUser(data) {
		const ts = now();
		return User.create({
			username: data.username,
			nickname: data.nickname ?? data.username,
			realname: data.realname ?? '',
			password: data.password,
			avatar: data.avatar ?? '',
			role: data.role ?? 'user',
			sex: data.sex ?? 0,
			birthday: data.birthday ?? 0,
			status: data.status ?? 1,
			create_time: ts,
			update_time: ts,
		});
	}

	static async updateUser(id, data) {
		const allowed = [
			'nickname',
			'realname',
			'avatar',
			'role',
			'status',
			'sex',
			'birthday',
			'github_nickname',
			'github_link',
			'qq_nickname',
			'qq_link',
			'music_nickname',
			'music_link',
		];
		const patch = {};
		for (const key of allowed) {
			if (data[key] !== undefined) patch[key] = data[key];
		}
		patch.update_time = now();
		return User.update(patch, { where: { id } });
	}

	static async updatePassword(id, hashed) {
		return User.update(
			{ password: hashed, update_time: now() },
			{ where: { id, status: 1 } }
		);
	}

	static async deleteUser(id) {
		return User.update(
			{ status: 0, update_time: now() },
			{ where: { id, status: { [Op.ne]: 0 } } }
		);
	}

	static async findByUsername(username) {
		return User.findOne({ where: { username, status: 1 } });
	}

	static async findAnyByUsername(username) {
		return User.findOne({ where: { username } });
	}

	static async getUserInfo(id, { includeDisabled = false } = {}) {
		const where = { id };
		if (!includeDisabled) where.status = 1;
		return User.findOne({
			attributes: { exclude: SAFE_ATTRS_EXCLUDE },
			where,
		});
	}

	static async getUserList({ page = 1, pageSize = 10, keyword = '', includeDisabled = false } = {}) {
		const offset = (page - 1) * pageSize;
		const where = {};
		if (!includeDisabled) where.status = 1;
		if (keyword) {
			where[Op.or] = [
				{ username: { [Op.like]: `%${keyword}%` } },
				{ nickname: { [Op.like]: `%${keyword}%` } },
			];
		}
		const { count, rows } = await User.findAndCountAll({
			attributes: { exclude: includeDisabled ? ADMIN_SAFE_EXCLUDE : SAFE_ATTRS_EXCLUDE },
			where,
			order: [['id', 'DESC']],
			offset,
			limit: pageSize,
		});
		return { count, rows, page, pageSize };
	}

	static async countActiveUsers() {
		return User.count({ where: { status: 1 } });
	}
}

export default UserModel;
