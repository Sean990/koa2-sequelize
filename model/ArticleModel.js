import { DataTypes, Op } from 'sequelize';
import { sequelize } from '../config/db.js';
import cmsArticle from '../schema/cms_article.js';
import cmsUser from '../schema/cms_user.js';
import cmsTag from '../schema/cms_tag.js';
import cmsArticleTag from '../schema/cms_article_tag.js';
import { now } from '../utils/format.js';

const Article = cmsArticle(sequelize, DataTypes);
const User = cmsUser(sequelize, DataTypes);
const Tag = cmsTag(sequelize, DataTypes);
const ArticleTag = cmsArticleTag(sequelize, DataTypes);

User.hasMany(Article, { as: 'articles', foreignKey: 'user_id', targetKey: 'id' });
Article.belongsTo(User, { as: 'user', foreignKey: 'user_id', targetKey: 'id' });

Article.belongsToMany(Tag, {
	as: 'tags',
	through: { model: ArticleTag, unique: false },
	foreignKey: 'article_id',
	otherKey: 'tag_id',
	constraints: false,
});
Tag.belongsToMany(Article, {
	as: 'articles',
	through: { model: ArticleTag, unique: false },
	foreignKey: 'tag_id',
	otherKey: 'article_id',
	constraints: false,
});

const publicUserAttrs = ['id', 'nickname', 'avatar'];
const publicTagAttrs = ['id', 'tag_title'];

function buildKeywordWhere(keyword = '') {
	const text = String(keyword || '').trim();
	if (!text) return {};
	return {
		[Op.or]: [
			{ article_title: { [Op.like]: `%${text}%` } },
			{ article_cont: { [Op.like]: `%${text}%` } },
		],
	};
}

async function syncArticleTags(articleId, tagIds) {
	if (!Array.isArray(tagIds)) return;
	await ArticleTag.destroy({ where: { article_id: articleId } });
	if (tagIds.length === 0) return;

	const activeTags = await Tag.findAll({
		where: { id: { [Op.in]: tagIds }, status: 1 },
		attributes: ['id'],
	});
	const validIds = activeTags.map((tag) => tag.id);
	if (validIds.length === 0) return;

	const ts = now();
	await ArticleTag.bulkCreate(
		validIds.map((tag_id) => ({
			article_id: articleId,
			tag_id,
			status: 1,
			create_time: ts,
			update_time: ts,
		}))
	);
}

class ArticleModel {
	static get raw() {
		return Article;
	}

	static async createArticle(data) {
		const ts = now();
		const article = await Article.create({
			article_title: data.article_title,
			user_id: data.user_id,
			article_cont: data.article_cont,
			article_pic: data.article_pic ?? '',
			status: data.status ?? 1,
			create_time: ts,
			update_time: ts,
		});
		await syncArticleTags(article.id, data.tag_ids);
		return article;
	}

	static async updateArticle(id, data) {
		const article = await Article.findByPk(id);
		if (!article || article.status === 0) return 0;

		const allowed = ['article_title', 'article_cont', 'article_pic', 'status'];
		const patch = {};
		for (const key of allowed) {
			if (data[key] !== undefined) patch[key] = data[key];
		}
		patch.update_time = now();
		await Article.update(patch, { where: { id } });
		await syncArticleTags(id, data.tag_ids);
		return 1;
	}

	static async deleteArticle(id) {
		return Article.update(
			{ status: 0, update_time: now() },
			{ where: { id, status: { [Op.ne]: 0 } } }
		);
	}

	static async incrementArticleView(id) {
		return Article.increment('article_view', { by: 1, where: { id, status: 1 } });
	}

	static async getArticleDetail(id) {
		return Article.findOne({
			where: { id, status: 1 },
			attributes: { exclude: ['user_id'] },
			include: [
				{
					model: Tag,
					as: 'tags',
					attributes: publicTagAttrs,
					through: { attributes: [] },
					where: { status: 1 },
					required: false,
				},
				{
					model: User,
					as: 'user',
					attributes: publicUserAttrs,
					where: { status: 1 },
				},
			],
		});
	}

	static async getArticleList(limit = 10) {
		return Article.findAll({
			where: { status: 1 },
			order: [['id', 'DESC']],
			attributes: ['id', 'article_title', 'article_pic', 'article_view', 'create_time', 'article_cont'],
			include: [
				{
					model: Tag,
					as: 'tags',
					attributes: publicTagAttrs,
					through: { attributes: [] },
					where: { status: 1 },
					required: false,
				},
				{
					model: User,
					as: 'user',
					attributes: publicUserAttrs,
					where: { status: 1 },
				},
			],
			limit: Number(limit) || 10,
		});
	}

	static async getPublicArticlePage({ page = 1, pageSize = 10, keyword = '', tag_id } = {}) {
		const offset = (page - 1) * pageSize;
		const tagWhere = tag_id ? { id: tag_id, status: 1 } : { status: 1 };
		const { count, rows } = await Article.findAndCountAll({
			where: {
				status: 1,
				...buildKeywordWhere(keyword),
			},
			order: [['id', 'DESC']],
			attributes: ['id', 'article_title', 'article_pic', 'article_view', 'create_time', 'article_cont'],
			include: [
				{
					model: Tag,
					as: 'tags',
					attributes: publicTagAttrs,
					through: { attributes: [] },
					where: tagWhere,
					required: Boolean(tag_id),
				},
				{
					model: User,
					as: 'user',
					attributes: publicUserAttrs,
					where: { status: 1 },
				},
			],
			offset,
			limit: pageSize,
			distinct: true,
		});
		return { count, rows, page, pageSize };
	}

	static async getAdminArticleList({ page = 1, pageSize = 10, keyword = '', status } = {}) {
		const offset = (page - 1) * pageSize;
		const where = buildKeywordWhere(keyword);
		if (status !== undefined && status !== '') where.status = status;

		const { count, rows } = await Article.findAndCountAll({
			where,
			order: [['id', 'DESC']],
			attributes: [
				'id',
				'article_title',
				'article_pic',
				'article_view',
				'status',
				'create_time',
				'update_time',
			],
			include: [
				{ model: Tag, as: 'tags', attributes: publicTagAttrs, through: { attributes: [] }, required: false },
				{ model: User, as: 'user', attributes: publicUserAttrs, required: false },
			],
			offset,
			limit: pageSize,
			distinct: true,
		});
		return { count, rows, page, pageSize };
	}

	static async getTagToArticleList(id) {
		return Tag.findOne({
			where: { id, status: 1 },
			attributes: ['id', 'tag_title'],
			include: [
				{
					model: Article,
					as: 'articles',
					attributes: ['id', 'article_title', 'article_pic', 'article_view', 'create_time', 'article_cont'],
					through: { attributes: [] },
					where: { status: 1 },
					required: false,
					include: [
						{
							model: User,
							as: 'user',
							attributes: publicUserAttrs,
							where: { status: 1 },
						},
					],
				},
			],
		});
	}

	static async getDashboardStats() {
		const [articleCount, draftCount, tagCount, viewCount] = await Promise.all([
			Article.count({ where: { status: 1 } }),
			Article.count({ where: { status: 2 } }),
			Tag.count({ where: { status: 1 } }),
			Article.sum('article_view', { where: { status: 1 } }),
		]);
		const recentArticles = await Article.findAll({
			where: { status: { [Op.in]: [1, 2] } },
			order: [['id', 'DESC']],
			limit: 5,
			attributes: ['id', 'article_title', 'status', 'article_view', 'create_time'],
		});
		return {
			articleCount,
			draftCount,
			tagCount,
			viewCount: Number(viewCount || 0),
			recentArticles,
		};
	}
}

export default ArticleModel;
