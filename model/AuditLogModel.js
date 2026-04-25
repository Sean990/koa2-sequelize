import { DataTypes } from 'sequelize';
import { sequelize } from '../config/db.js';
import cmsAuditLog from '../schema/cms_audit_log.js';
import { now } from '../utils/format.js';

const AuditLog = cmsAuditLog(sequelize, DataTypes);

class AuditLogModel {
	static get raw() {
		return AuditLog;
	}

	static async createLog(data) {
		return AuditLog.create({
			user_id: data.user_id ?? 0,
			username: data.username ?? '',
			method: data.method ?? '',
			path: data.path ?? '',
			status: data.status ?? 0,
			ip: data.ip ?? '',
			user_agent: data.user_agent ?? '',
			request_body: data.request_body ?? '',
			response_code: data.response_code ?? 0,
			cost_ms: data.cost_ms ?? 0,
			create_time: now(),
		});
	}

	static async getLogList({ page = 1, pageSize = 20 } = {}) {
		const { count, rows } = await AuditLog.findAndCountAll({
			order: [['id', 'DESC']],
			offset: (page - 1) * pageSize,
			limit: pageSize,
		});
		return { count, rows, page, pageSize };
	}
}

export default AuditLogModel;
