import { DataTypes, Op } from 'sequelize';
import { sequelize } from '../config/db.js';
import cmsTag from '../schema/cms_tag.js';
import { now } from '../utils/format.js';

const Tag = cmsTag(sequelize, DataTypes);

class TagModel {
	static get raw() {
		return Tag;
	}

	static async createTag(data) {
		const ts = now();
		return Tag.create({
			tag_title: data.tag_title,
			status: data.status ?? 1,
			create_time: ts,
			update_time: ts,
		});
	}

	static async updateTag(id, data) {
		const patch = { update_time: now() };
		if (data.tag_title !== undefined) patch.tag_title = data.tag_title;
		if (data.status !== undefined) patch.status = data.status;
		return Tag.update(patch, { where: { id } });
	}

	static async deleteTag(id) {
		return Tag.update(
			{ status: 0, update_time: now() },
			{ where: { id, status: { [Op.ne]: 0 } } }
		);
	}

	static async findByTitle(tagTitle, { includeDisabled = false } = {}) {
		const where = { tag_title: tagTitle };
		if (!includeDisabled) where.status = 1;
		return Tag.findOne({ where });
	}

	static async getTagList() {
		return Tag.findAll({
			where: { status: 1 },
			limit: 100,
			order: [['id', 'DESC']],
		});
	}

	static async getAdminTagList({ page = 1, pageSize = 20, keyword = '', status } = {}) {
		const where = {};
		if (keyword) where.tag_title = { [Op.like]: `%${keyword}%` };
		if (status !== undefined && status !== '') where.status = status;
		const { count, rows } = await Tag.findAndCountAll({
			where,
			order: [['id', 'DESC']],
			offset: (page - 1) * pageSize,
			limit: pageSize,
		});
		return { count, rows, page, pageSize };
	}
}

export default TagModel;
