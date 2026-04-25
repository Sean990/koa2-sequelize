import SettingModel, { parseSettingValue } from '../model/SettingModel.js';
import { created, empty, success } from '../utils/response.js';
import { formatDate, toPlain } from '../utils/format.js';
import {
	normalizeBooleanFlag,
	optionalString,
	pagination,
	positiveInt,
	requireString,
} from '../utils/validators.js';
import { NotFound, ParameterException } from '../utils/http-exception.js';

const VALUE_TYPES = new Set(['string', 'number', 'boolean', 'json']);

function normalizeValueType(value = 'string') {
	if (!VALUE_TYPES.has(value)) {
		throw new ParameterException('设置值类型只能是 string、number、boolean 或 json');
	}
	return value;
}

function buildPayload(body = {}, { partial = false } = {}) {
	const payload = {};
	if (!partial || body.setting_key !== undefined) {
		payload.setting_key = requireString(body, 'setting_key', '设置键名', { max: 80 });
		if (!/^[a-zA-Z0-9_.-]+$/.test(payload.setting_key)) {
			throw new ParameterException('设置键名只能包含字母、数字、点、中划线和下划线');
		}
	}
	if (!partial || body.setting_value !== undefined) {
		payload.setting_value = body.setting_value ?? '';
	}
	if (body.value_type !== undefined || !partial) payload.value_type = normalizeValueType(body.value_type || 'string');
	if (body.remark !== undefined) payload.remark = optionalString(body, 'remark', '备注', { max: 255 }) || '';
	if (body.is_public !== undefined || !partial) payload.is_public = normalizeBooleanFlag(body.is_public, 1, '公开状态');
	return payload;
}

function normalizeSetting(item) {
	const data = item.toJSON ? item.toJSON() : item;
	data.value = parseSettingValue(data.setting_value, data.value_type);
	data.create_time = formatDate(data.create_time);
	data.update_time = formatDate(data.update_time);
	return data;
}

class SettingController {
	static async publicMap(ctx) {
		success(ctx, await SettingModel.getSettingMap({ publicOnly: true }), '查询成功');
	}

	static async adminMap(ctx) {
		success(ctx, await SettingModel.getSettingMap({ publicOnly: false }), '查询成功');
	}

	static async adminList(ctx) {
		const { page, pageSize } = pagination(ctx.query, { defaultPageSize: 50, maxPageSize: 100 });
		const raw = await SettingModel.getAdminSettingList({ page, pageSize, keyword: ctx.query.keyword });
		success(ctx, {
			...raw,
			rows: toPlain(raw.rows).map(normalizeSetting),
		}, '查询成功');
	}

	static async upsert(ctx) {
		const setting = await SettingModel.upsertSetting(buildPayload(ctx.request.body || {}));
		created(ctx, { id: setting.id }, '保存成功');
	}

	static async update(ctx) {
		const id = positiveInt(ctx.params.id, '设置ID');
		const payload = buildPayload(ctx.request.body || {}, { partial: true });
		if (Object.keys(payload).length === 0) throw new ParameterException('没有可更新的内容');
		const [affected] = await SettingModel.updateSetting(id, payload);
		if (!affected) throw new NotFound('设置不存在');
		empty(ctx, '更新成功');
	}

	static async remove(ctx) {
		const id = positiveInt(ctx.params.id, '设置ID');
		const affected = await SettingModel.deleteSetting(id);
		if (!affected) throw new NotFound('设置不存在');
		empty(ctx, '删除成功');
	}
}

export default SettingController;
