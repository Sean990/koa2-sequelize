import { ParameterException } from './http-exception.js';

const STATUS_VALUES = new Set([0, 1, 2]);

export function trimString(value) {
	return typeof value === 'string' ? value.trim() : value;
}

export function requireString(source, field, label = field, { max = 255, min = 1 } = {}) {
	const value = trimString(source?.[field]);
	if (typeof value !== 'string' || value.length < min) {
		throw new ParameterException(`${label}不能为空`);
	}
	if (value.length > max) {
		throw new ParameterException(`${label}不能超过${max}个字符`);
	}
	return value;
}

export function optionalString(source, field, label = field, { max = 255 } = {}) {
	const value = trimString(source?.[field]);
	if (value === undefined || value === null) return undefined;
	if (typeof value !== 'string') {
		throw new ParameterException(`${label}格式不正确`);
	}
	if (value.length > max) {
		throw new ParameterException(`${label}不能超过${max}个字符`);
	}
	return value;
}

export function positiveInt(value, label = 'ID') {
	const num = Number.parseInt(value, 10);
	if (!Number.isInteger(num) || num <= 0) {
		throw new ParameterException(`${label}必须是正整数`);
	}
	return num;
}

export function optionalPositiveInt(value, defaultValue, label = '参数') {
	if (value === undefined || value === null || value === '') return defaultValue;
	const num = Number.parseInt(value, 10);
	if (!Number.isInteger(num) || num <= 0) {
		throw new ParameterException(`${label}必须是正整数`);
	}
	return num;
}

export function pagination(query = {}, { defaultPageSize = 10, maxPageSize = 100 } = {}) {
	const page = optionalPositiveInt(query.page, 1, '页码');
	const rawPageSize = optionalPositiveInt(query.pageSize, defaultPageSize, '每页数量');
	return {
		page,
		pageSize: Math.min(rawPageSize, maxPageSize),
	};
}

export function normalizeStatus(value, { defaultValue = 1 } = {}) {
	if (value === undefined || value === null || value === '') return defaultValue;
	const status = Number.parseInt(value, 10);
	if (!STATUS_VALUES.has(status)) {
		throw new ParameterException('状态只能是 0、1 或 2');
	}
	return status;
}

export function parseTagIds(value) {
	if (value === undefined || value === null || value === '') return undefined;
	const ids = Array.isArray(value) ? value : String(value).split(',');
	const normalized = ids
		.map((id) => Number.parseInt(id, 10))
		.filter((id) => Number.isInteger(id) && id > 0);
	return [...new Set(normalized)];
}

export function requireUrl(source, field, label = field) {
	const value = requireString(source, field, label, { max: 255 });
	try {
		const url = new URL(value);
		if (!['http:', 'https:'].includes(url.protocol)) {
			throw new Error('invalid protocol');
		}
		return value;
	} catch {
		throw new ParameterException(`${label}必须是有效的 http 或 https 地址`);
	}
}

export function validateRole(value, defaultValue = 'user') {
	const role = trimString(value) || defaultValue;
	if (!['admin', 'editor', 'user'].includes(role)) {
		throw new ParameterException('角色只能是 admin、editor 或 user');
	}
	return role;
}
