import { DataTypes, Op } from 'sequelize';
import { sequelize } from '../config/db.js';
import cmsFriendLink from '../schema/cms_friendlink.js';
import { now } from '../utils/format.js';

const FriendLink = cmsFriendLink(sequelize, DataTypes);

class FriendLinkModel {
	static get raw() {
		return FriendLink;
	}

	static async createFriendLink(data) {
		const ts = now();
		return FriendLink.create({
			friendlink_url: data.friendlink_url,
			friendlink_title: data.friendlink_title,
			status: data.status ?? 1,
			create_time: ts,
			update_time: ts,
		});
	}

	static async updateFriendLink(id, data) {
		const patch = { update_time: now() };
		if (data.friendlink_url !== undefined) patch.friendlink_url = data.friendlink_url;
		if (data.friendlink_title !== undefined) patch.friendlink_title = data.friendlink_title;
		if (data.status !== undefined) patch.status = data.status;
		return FriendLink.update(patch, { where: { id } });
	}

	static async deleteFriendLink(id) {
		return FriendLink.update(
			{ status: 0, update_time: now() },
			{ where: { id, status: { [Op.ne]: 0 } } }
		);
	}

	static async getFriendLinkList() {
		return FriendLink.findAll({
			where: { status: 1 },
			limit: 50,
			order: [['id', 'DESC']],
		});
	}

	static async getAdminFriendLinkList({ page = 1, pageSize = 20, keyword = '', status } = {}) {
		const where = {};
		if (keyword) {
			where[Op.or] = [
				{ friendlink_title: { [Op.like]: `%${keyword}%` } },
				{ friendlink_url: { [Op.like]: `%${keyword}%` } },
			];
		}
		if (status !== undefined && status !== '') where.status = status;
		const { count, rows } = await FriendLink.findAndCountAll({
			where,
			order: [['id', 'DESC']],
			offset: (page - 1) * pageSize,
			limit: pageSize,
		});
		return { count, rows, page, pageSize };
	}

	static async countActiveFriendLinks() {
		return FriendLink.count({ where: { status: 1 } });
	}
}

export default FriendLinkModel;
