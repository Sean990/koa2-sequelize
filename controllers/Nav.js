import NavModel from '../model/NavModel.js';
import { created, empty, success } from '../utils/response.js';
import { formatDate, toPlain } from '../utils/format.js';
import {
	normalizeStatus,
	optionalInt,
	optionalString,
	pagination,
	positiveInt,
	requireString,
} from '../utils/validators.js';
import { NotFound, ParameterException } from '../utils/http-exception.js';

function normalizeNav(item) {
	const data = item.toJSON ? item.toJSON() : item;
	data.create_time = formatDate(data.create_time);
	data.update_time = formatDate(data.update_time);
	return data;
}

function normalizeTarget(value = '_self') {
	const target = value || '_self';
	if (!['_self', '_blank'].includes(target)) {
		throw new ParameterException('导航打开方式只能是 _self 或 _blank');
	}
	return target;
}

function buildPayload(body, { partial = false } = {}) {
	const payload = {};
	if (!partial || body.nav_name !== undefined) {
		payload.nav_name = requireString(body, 'nav_name', '导航名称', { max: 30 });
	}
	if (!partial || body.nav_url !== undefined) {
		payload.nav_url = requireString(body, 'nav_url', '导航地址', { max: 255 });
	}
	if (body.nav_icon !== undefined) {
		payload.nav_icon = optionalString(body, 'nav_icon', '导航图片', { max: 255 }) || '';
	}
	if (body.target !== undefined || !partial) payload.target = normalizeTarget(body.target);
	if (body.sort !== undefined || !partial) payload.sort = optionalInt(body.sort, 0, '排序值');
	if (body.status !== undefined || !partial) payload.status = normalizeStatus(body.status, { defaultValue: 1 });
	return payload;
}

class NavController {
	static async list(ctx) {
		const data = toPlain(await NavModel.getPublicNavList()).map(normalizeNav);
		success(ctx, data, '查询成功');
	}

	static async adminList(ctx) {
		const { page, pageSize } = pagination(ctx.query, { defaultPageSize: 20 });
		const status = ctx.query.status === undefined || ctx.query.status === ''
			? undefined
			: normalizeStatus(ctx.query.status);
		const raw = await NavModel.getAdminNavList({
			page,
			pageSize,
			keyword: ctx.query.keyword,
			status,
		});
		success(ctx, {
			...raw,
			rows: toPlain(raw.rows).map(normalizeNav),
		}, '查询成功');
	}

	static async create(ctx) {
		const nav = await NavModel.createNav(buildPayload(ctx.request.body || {}));
		created(ctx, { id: nav.id }, '创建成功');
	}

	static async update(ctx) {
		const id = positiveInt(ctx.params.id, '导航ID');
		const payload = buildPayload(ctx.request.body || {}, { partial: true });
		if (Object.keys(payload).length === 0) throw new ParameterException('没有可更新的内容');
		const [affected] = await NavModel.updateNav(id, payload);
		if (!affected) throw new NotFound('导航不存在');
		empty(ctx, '更新成功');
	}

	static async remove(ctx) {
		const id = positiveInt(ctx.params.id, '导航ID');
		const [affected] = await NavModel.deleteNav(id);
		if (!affected) throw new NotFound('导航不存在');
		empty(ctx, '删除成功');
	}
}

export default NavController;
