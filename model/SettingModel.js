import { DataTypes, Op } from 'sequelize';
import { sequelize } from '../config/db.js';
import cmsSetting from '../schema/cms_setting.js';
import { now } from '../utils/format.js';

const Setting = cmsSetting(sequelize, DataTypes);

function serializeValue(value, valueType = 'string') {
	if (valueType === 'json') return JSON.stringify(value ?? null);
	if (valueType === 'number') return String(Number(value ?? 0));
	if (valueType === 'boolean') return value ? '1' : '0';
	return value === undefined || value === null ? '' : String(value);
}

export function parseSettingValue(value, valueType = 'string') {
	if (valueType === 'json') {
		try {
			return JSON.parse(value || 'null');
		} catch {
			return null;
		}
	}
	if (valueType === 'number') return Number(value || 0);
	if (valueType === 'boolean') return value === '1' || value === 'true';
	return value ?? '';
}

class SettingModel {
	static get raw() {
		return Setting;
	}

	static async upsertSetting(data) {
		const ts = now();
		const payload = {
			setting_key: data.setting_key,
			setting_value: serializeValue(data.setting_value, data.value_type),
			value_type: data.value_type ?? 'string',
			remark: data.remark ?? '',
			is_public: data.is_public ?? 1,
			update_time: ts,
		};
		const existing = await Setting.findOne({ where: { setting_key: data.setting_key } });
		if (existing) {
			await Setting.update(payload, { where: { id: existing.id } });
			return Setting.findByPk(existing.id);
		}
		return Setting.create({ ...payload, create_time: ts });
	}

	static async updateSetting(id, data) {
		const patch = { update_time: now() };
		for (const key of ['setting_key', 'value_type', 'remark', 'is_public']) {
			if (data[key] !== undefined) patch[key] = data[key];
		}
		if (data.setting_value !== undefined) {
			patch.setting_value = serializeValue(data.setting_value, data.value_type ?? 'string');
		}
		return Setting.update(patch, { where: { id } });
	}

	static async deleteSetting(id) {
		return Setting.destroy({ where: { id } });
	}

	static async getSettingMap({ publicOnly = true } = {}) {
		const where = publicOnly ? { is_public: 1 } : {};
		const rows = await Setting.findAll({ where, order: [['id', 'ASC']] });
		return rows.reduce((sum, item) => {
			sum[item.setting_key] = parseSettingValue(item.setting_value, item.value_type);
			return sum;
		}, {});
	}

	static async getAdminSettingList({ page = 1, pageSize = 50, keyword = '' } = {}) {
		const where = {};
		if (keyword) {
			where[Op.or] = [
				{ setting_key: { [Op.like]: `%${keyword}%` } },
				{ remark: { [Op.like]: `%${keyword}%` } },
			];
		}
		const { count, rows } = await Setting.findAndCountAll({
			where,
			order: [['id', 'DESC']],
			offset: (page - 1) * pageSize,
			limit: pageSize,
		});
		return { count, rows, page, pageSize };
	}
}

export default SettingModel;
