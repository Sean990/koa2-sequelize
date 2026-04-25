import CategoryModel from '../model/CategoryModel.js';
import { created, empty, success } from '../utils/response.js';
import { formatDate, toPlain } from '../utils/format.js';
import {
	normalizeStatus,
	optionalInt,
	optionalSlug,
	optionalString,
	pagination,
	positiveInt,
	requireString,
} from '../utils/validators.js';
import { Existing, NotFound, ParameterException } from '../utils/http-exception.js';

function normalizeCategory(item) {
	const data = item.toJSON ? item.toJSON() : item;
	data.create_time = formatDate(data.create_time);
	data.update_time = formatDate(data.update_time);
	return data;
}

function buildPayload(body, { partial = false } = {}) {
	const payload = {};
	if (!partial || body.category_name !== undefined) {
		payload.category_name = requireString(body, 'category_name', '分类名称', { max: 30 });
	}
	if (body.category_slug !== undefined) {
		payload.category_slug = optionalSlug(body, 'category_slug', '分类别名', { max: 80 }) || '';
	}
	if (body.description !== undefined) {
		payload.description = optionalString(body, 'description', '分类描述', { max: 255 }) || '';
	}
	if (body.sort !== undefined || !partial) payload.sort = optionalInt(body.sort, 0, '排序值');
	if (body.status !== undefined || !partial) payload.status = normalizeStatus(body.status, { defaultValue: 1 });
	return payload;
}

class CategoryController {
	static async list(ctx) {
		const data = toPlain(await CategoryModel.getPublicCategoryList()).map(normalizeCategory);
		success(ctx, data, '查询成功');
	}

	static async adminList(ctx) {
		const { page, pageSize } = pagination(ctx.query, { defaultPageSize: 20 });
		const status = ctx.query.status === undefined || ctx.query.status === ''
			? undefined
			: normalizeStatus(ctx.query.status);
		const raw = await CategoryModel.getAdminCategoryList({
			page,
			pageSize,
			keyword: ctx.query.keyword,
			status,
		});
		success(ctx, {
			...raw,
			rows: toPlain(raw.rows).map(normalizeCategory),
		}, '查询成功');
	}

	static async create(ctx) {
		const payload = buildPayload(ctx.request.body || {});
		if (payload.category_slug) {
			const existing = await CategoryModel.findBySlug(payload.category_slug);
			if (existing) throw new Existing('分类别名已存在');
		}
		const category = await CategoryModel.createCategory(payload);
		created(ctx, { id: category.id }, '创建成功');
	}

	static async update(ctx) {
		const id = positiveInt(ctx.params.id, '分类ID');
		const payload = buildPayload(ctx.request.body || {}, { partial: true });
		if (Object.keys(payload).length === 0) throw new ParameterException('没有可更新的内容');
		if (payload.category_slug) {
			const existing = await CategoryModel.findBySlug(payload.category_slug);
			if (existing && existing.id !== id) throw new Existing('分类别名已存在');
		}
		const [affected] = await CategoryModel.updateCategory(id, payload);
		if (!affected) throw new NotFound('分类不存在');
		empty(ctx, '更新成功');
	}

	static async remove(ctx) {
		const id = positiveInt(ctx.params.id, '分类ID');
		const [affected] = await CategoryModel.deleteCategory(id);
		if (!affected) throw new NotFound('分类不存在');
		empty(ctx, '删除成功');
	}
}

export default CategoryController;
