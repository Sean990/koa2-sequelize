import ArticleModel from '../model/ArticleModel.js';
import TagModel from '../model/TagModel.js';
import { created, empty, success } from '../utils/response.js';
import { excerpt, formatDate, formatDateTime, toPlain } from '../utils/format.js';
import {
	normalizeStatus,
	pagination,
	positiveInt,
	requireString,
} from '../utils/validators.js';
import { Existing, NotFound, ParameterException } from '../utils/http-exception.js';

function normalizeTag(item) {
	const data = item.toJSON ? item.toJSON() : item;
	data.create_time = formatDate(data.create_time);
	data.update_time = formatDate(data.update_time);
	return data;
}

class TagController {
	static async Tag(ctx) {
		const data = toPlain(await TagModel.getTagList()).map(normalizeTag);
		success(ctx, data, '查询成功');
	}

	static async adminList(ctx) {
		const { page, pageSize } = pagination(ctx.query, { defaultPageSize: 20 });
		const status = ctx.query.status === undefined || ctx.query.status === ''
			? undefined
			: normalizeStatus(ctx.query.status);
		const raw = await TagModel.getAdminTagList({
			page,
			pageSize,
			keyword: ctx.query.keyword,
			status,
		});
		const data = {
			...raw,
			rows: toPlain(raw.rows).map(normalizeTag),
		};
		success(ctx, data, '查询成功');
	}

	static async create(ctx) {
		const tag_title = requireString(ctx.request.body || {}, 'tag_title', '标签名称', { max: 30 });
		const existing = await TagModel.findByTitle(tag_title);
		if (existing) throw new Existing('标签已存在');
		const tag = await TagModel.createTag({ tag_title });
		created(ctx, { id: tag.id }, '创建成功');
	}

	static async update(ctx) {
		const id = positiveInt(ctx.params.id, '标签ID');
		const body = ctx.request.body || {};
		const payload = {};
		if (body.tag_title !== undefined) {
			payload.tag_title = requireString(body, 'tag_title', '标签名称', { max: 30 });
			const existing = await TagModel.findByTitle(payload.tag_title);
			if (existing && existing.id !== id) throw new Existing('标签已存在');
		}
		if (body.status !== undefined) payload.status = normalizeStatus(body.status);
		if (Object.keys(payload).length === 0) throw new ParameterException('没有可更新的内容');
		const [affected] = await TagModel.updateTag(id, payload);
		if (!affected) throw new NotFound('标签不存在');
		empty(ctx, '更新成功');
	}

	static async remove(ctx) {
		const id = positiveInt(ctx.params.id, '标签ID');
		const [affected] = await TagModel.deleteTag(id);
		if (!affected) throw new NotFound('标签不存在');
		empty(ctx, '删除成功');
	}

	static async TagToArticleList(ctx) {
		const id = positiveInt(ctx.query.id, '标签ID');
		const raw = await ArticleModel.getTagToArticleList(id);
		if (!raw) throw new NotFound('标签不存在');
		const data = toPlain(raw);
		(data.articles || []).forEach((item) => {
			item.article_cont = excerpt(item.article_cont, 200);
			item.user = item.user || null;
			item.detail_time = formatDateTime(item.create_time);
			item.create_time = formatDate(item.create_time);
		});
		data.article_count = (data.articles || []).length;
		data.articles = data.articles || [];
		success(ctx, data, '查询成功');
	}
}

export default TagController;
