import ArticleModel from '../model/ArticleModel.js';
import FriendLinkModel from '../model/FriendLinkModel.js';
import UserModel from '../model/UserModel.js';
import { success } from '../utils/response.js';
import { excerpt, formatDate, formatDateTime, toPlain } from '../utils/format.js';

function normalizeIndexArticle(item, { withContent = true } = {}) {
	item.tags = item.tags || [];
	item.user = item.user || null;
	if (!withContent) {
		delete item.article_cont;
	} else {
		item.article_cont = excerpt(item.article_cont, 300);
	}
	item.detail_time = formatDateTime(item.create_time);
	item.create_time = formatDate(item.create_time);
	return item;
}

class IndexController {
	static async Index(ctx) {
		const data = toPlain(await ArticleModel.getArticleList(10))
			.map((item) => normalizeIndexArticle(item));
		success(ctx, data, '查询成功');
	}

	static async Recent(ctx) {
		const data = toPlain(await ArticleModel.getArticleList(3))
			.map((item) => normalizeIndexArticle(item, { withContent: false }));
		success(ctx, data, '查询成功');
	}

	static async Dashboard(ctx) {
		const [articleStats, userCount, friendLinkCount] = await Promise.all([
			ArticleModel.getDashboardStats(),
			UserModel.countActiveUsers(),
			FriendLinkModel.countActiveFriendLinks(),
		]);
		const data = {
			...articleStats,
			userCount,
			friendLinkCount,
			recentArticles: toPlain(articleStats.recentArticles).map((item) => ({
				...item,
				create_time: formatDate(item.create_time),
			})),
		};
		success(ctx, data, '查询成功');
	}
}

export default IndexController;
