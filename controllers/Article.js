import ArticleModel from '../model/ArticleModel.js';
import { empty, created, success } from '../utils/response.js';
import { excerpt, formatDate, formatDateTime, toPlain } from '../utils/format.js';
import {
	normalizeStatus,
	pagination,
	parseTagIds,
	positiveInt,
	optionalString,
	requireString,
} from '../utils/validators.js';
import { NotFound, ParameterException } from '../utils/http-exception.js';

function normalizeArticle(item, { contentLimit = 300, withUpdateTime = false } = {}) {
	const data = item.toJSON ? item.toJSON() : item;
	data.tags = data.tags || [];
	data.user = data.user || null;
	if (data.article_cont && contentLimit) {
		data.article_cont = excerpt(data.article_cont, contentLimit);
	}
	data.detail_time = formatDateTime(data.create_time);
	data.create_time = formatDate(data.create_time);
	if (withUpdateTime) data.update_time = formatDate(data.update_time);
	return data;
}

function buildArticlePayload(body, { partial = false } = {}) {
	const payload = {};

	if (!partial || body.article_title !== undefined) {
		payload.article_title = requireString(body, 'article_title', '文章标题', { max: 120 });
	}
	if (!partial || body.article_cont !== undefined) {
		payload.article_cont = requireString(body, 'article_cont', '文章内容', { max: 1000000 });
	}
	if (body.article_pic !== undefined) {
		payload.article_pic = optionalString(body, 'article_pic', '文章封面', { max: 255 }) || '';
	}
	if (body.status !== undefined || !partial) {
		payload.status = normalizeStatus(body.status, { defaultValue: 1 });
	}
	const tagIds = parseTagIds(body.tag_ids);
	if (tagIds !== undefined) payload.tag_ids = tagIds;

	return payload;
}

class ArticleController {
	static async list(ctx) {
		const { page, pageSize } = pagination(ctx.query);
		const tag_id = ctx.query.tag_id ? positiveInt(ctx.query.tag_id, '标签ID') : undefined;
		const raw = await ArticleModel.getPublicArticlePage({
			page,
			pageSize,
			keyword: ctx.query.keyword,
			tag_id,
		});
		const data = {
			...raw,
			rows: toPlain(raw.rows).map((item) => normalizeArticle(item, { contentLimit: 300 })),
		};
		success(ctx, data, '查询成功');
	}

	static async create(ctx) {
		const user_id = ctx.state.user?.uid;
		if (!user_id) throw new ParameterException('登录信息无效');
		const payload = buildArticlePayload(ctx.request.body || {});
		const article = await ArticleModel.createArticle({ ...payload, user_id });
		created(ctx, { id: article.id }, '创建文章成功');
	}

	static async update(ctx) {
		const id = positiveInt(ctx.params.id, '文章ID');
		const payload = buildArticlePayload(ctx.request.body || {}, { partial: true });
		if (Object.keys(payload).length === 0) {
			throw new ParameterException('没有可更新的内容');
		}
		const affected = await ArticleModel.updateArticle(id, payload);
		if (!affected) throw new NotFound('文章不存在');
		empty(ctx, '更新成功');
	}

	static async remove(ctx) {
		const id = positiveInt(ctx.params.id, '文章ID');
		const [affected] = await ArticleModel.deleteArticle(id);
		if (!affected) throw new NotFound('文章不存在');
		empty(ctx, '删除成功');
	}

	static async adminList(ctx) {
		const { page, pageSize } = pagination(ctx.query);
		const status = ctx.query.status === undefined || ctx.query.status === ''
			? undefined
			: normalizeStatus(ctx.query.status);
		const raw = await ArticleModel.getAdminArticleList({
			page,
			pageSize,
			keyword: ctx.query.keyword,
			status,
		});
		const data = {
			...raw,
			rows: toPlain(raw.rows).map((item) => normalizeArticle(item, {
				contentLimit: 0,
				withUpdateTime: true,
			})),
		};
		success(ctx, data, '查询成功');
	}

	static async detail(ctx) {
		const id = positiveInt(ctx.query.id, '文章ID');
		const raw = await ArticleModel.getArticleDetail(id);
		if (!raw) throw new NotFound('文章不存在');
		await ArticleModel.incrementArticleView(id);
		const data = normalizeArticle(toPlain(raw), { contentLimit: 0, withUpdateTime: true });
		data.article_view = Number(data.article_view || 0) + 1;
		success(ctx, data, '查询成功');
	}
}

export default ArticleController;
