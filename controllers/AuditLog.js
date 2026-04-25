import AuditLogModel from '../model/AuditLogModel.js';
import { success } from '../utils/response.js';
import { formatDateTime, toPlain } from '../utils/format.js';
import { pagination } from '../utils/validators.js';

class AuditLogController {
	static async list(ctx) {
		const { page, pageSize } = pagination(ctx.query, { defaultPageSize: 20, maxPageSize: 100 });
		const raw = await AuditLogModel.getLogList({ page, pageSize });
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
