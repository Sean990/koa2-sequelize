import { DataTypes, Op } from 'sequelize';
import { sequelize } from '../config/db.js';
import cmsCategory from '../schema/cms_category.js';
import { now } from '../utils/format.js';

const Category = cmsCategory(sequelize, DataTypes);

class CategoryModel {
	static get raw() {
		return Category;
	}

	static async createCategory(data) {
		const ts = now();
		return Category.create({
			category_name: data.category_name,
			category_slug: data.category_slug ?? '',
			description: data.description ?? '',
			sort: data.sort ?? 0,
			status: data.status ?? 1,
			create_time: ts,
			update_time: ts,
		});
	}

	static async updateCategory(id, data) {
		const patch = { update_time: now() };
		for (const key of ['category_name', 'category_slug', 'description', 'sort', 'status']) {
			if (data[key] !== undefined) patch[key] = data[key];
		}
		return Category.update(patch, { where: { id } });
	}

	static async deleteCategory(id) {
		return Category.update(
			{ status: 0, update_time: now() },
			{ where: { id, status: { [Op.ne]: 0 } } }
		);
	}

	static async findBySlug(slug, { includeDisabled = false } = {}) {
		if (!slug) return null;
		const where = { category_slug: slug };
		if (!includeDisabled) where.status = 1;
		return Category.findOne({ where });
	}

	static async getPublicCategoryList() {
		return Category.findAll({
			where: { status: 1 },
			order: [['sort', 'DESC'], ['id', 'DESC']],
		});
	}

	static async getAdminCategoryList({ page = 1, pageSize = 20, keyword = '', status } = {}) {
		const where = {};
		if (keyword) {
			where[Op.or] = [
				{ category_name: { [Op.like]: `%${keyword}%` } },
				{ category_slug: { [Op.like]: `%${keyword}%` } },
			];
		}
		if (status !== undefined && status !== '') where.status = status;
		const { count, rows } = await Category.findAndCountAll({
			where,
			order: [['sort', 'DESC'], ['id', 'DESC']],
			offset: (page - 1) * pageSize,
			limit: pageSize,
		});
		return { count, rows, page, pageSize };
	}
}

export default CategoryModel;
