import { DataTypes, Op } from 'sequelize';
import { sequelize } from '../config/db.js';
import cmsNav from '../schema/cms_nav.js';
import { now } from '../utils/format.js';

const Nav = cmsNav(sequelize, DataTypes);

class NavModel {
	static get raw() {
		return Nav;
	}

	static async createNav(data) {
		const ts = now();
		return Nav.create({
			nav_name: data.nav_name,
			nav_url: data.nav_url,
			target: data.target ?? '_self',
			sort: data.sort ?? 0,
			status: data.status ?? 1,
			create_time: ts,
			update_time: ts,
		});
	}

	static async updateNav(id, data) {
		const patch = { update_time: now() };
		for (const key of ['nav_name', 'nav_url', 'target', 'sort', 'status']) {
			if (data[key] !== undefined) patch[key] = data[key];
		}
		return Nav.update(patch, { where: { id } });
	}

	static async deleteNav(id) {
		return Nav.update(
			{ status: 0, update_time: now() },
			{ where: { id, status: { [Op.ne]: 0 } } }
		);
	}

	static async getPublicNavList() {
		return Nav.findAll({
			where: { status: 1 },
			order: [['sort', 'DESC'], ['id', 'DESC']],
		});
	}

	static async getAdminNavList({ page = 1, pageSize = 20, keyword = '', status } = {}) {
		const where = {};
		if (keyword) {
			where[Op.or] = [
				{ nav_name: { [Op.like]: `%${keyword}%` } },
				{ nav_url: { [Op.like]: `%${keyword}%` } },
			];
		}
		if (status !== undefined && status !== '') where.status = status;
		const { count, rows } = await Nav.findAndCountAll({
			where,
			order: [['sort', 'DESC'], ['id', 'DESC']],
			offset: (page - 1) * pageSize,
			limit: pageSize,
		});
		return { count, rows, page, pageSize };
	}
}

export default NavModel;
