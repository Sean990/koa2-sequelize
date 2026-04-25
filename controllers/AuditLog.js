import AuditLogModel from '../model/AuditLogModel.js';
import { success } from '../utils/response.js';
import { formatDateTime, toPlain } from '../utils/format.js';
import { optionalInt, pagination } from '../utils/validators.js';

function parseTimestamp(value) {
	if (!value) return undefined;
	const asNumber = Number.parseInt(value, 10);
	if (Number.isInteger(asNumber) && String(asNumber).length >= 10) return asNumber;
	const time = Date.parse(value);
	if (Number.isNaN(time)) return undefined;
	return Math.floor(time / 1000);
}

class AuditLogController {
	static async list(ctx) {
		const { page, pageSize } = pagination(ctx.query, { defaultPageSize: 20, maxPageSize: 100 });
		const status = ctx.query.status === undefined || ctx.query.status === ''
			? undefined
			: optionalInt(ctx.query.status, undefined, '状态码', { min: 100, max: 599 });
		const raw = await AuditLogModel.getLogList({
			page,
			pageSize,
			username: ctx.query.username,
			method: ctx.query.method,
			path: ctx.query.path,
			status,
			start_time: parseTimestamp(ctx.query.start_time),
			end_time: parseTimestamp(ctx.query.end_time),
		});
		success(ctx, {
			...raw,
			rows: toPlain(raw.rows).map((item) => ({
				...item,
				create_time: formatDateTime(item.create_time),
			})),
		}, '查询成功');
	}
}

export default AuditLogController;
