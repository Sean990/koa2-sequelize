import ArticleModel from '../model/ArticleModel.js';
import { success } from '../utils/response.js';
import { excerpt, formatDate, formatDateTime, toPlain } from '../utils/format.js';

class ArchivesController {
	static async Index(ctx) {
		const cache = {};
		const dataList = toPlain(await ArticleModel.getArticleList(100)).map((item) => {
			delete item.tags;
			delete item.user;
			item.article_cont = excerpt(item.article_cont, 300);
			item.detail_time = formatDateTime(item.create_time);
			item.article_year = formatDate(item.create_time, 'YYYY年');
			item.create_time = formatDate(item.create_time, 'MM月DD日');
			return item;
		});

		const data = dataList.reduce((sum, cur) => {
			const index = cache[cur.article_year];
			if (index !== undefined) {
				sum[index].push(cur);
			} else {
				sum.push([cur]);
				cache[cur.article_year] = sum.length - 1;
			}
			return sum;
		}, []);

		success(ctx, data, '查询成功');
	}
}

export default ArchivesController;
