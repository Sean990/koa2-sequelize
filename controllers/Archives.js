/**
 ├── controllers
 └── Index.js
 */
const ArticleModel = require('../model/ArticleModel')
const moment = require('moment')

class ArchivesController {
    static async Index(ctx){
        try {
            // 查询文章详情模型
            let cache = {},
                data = [],
                dataList = JSON.parse(JSON.stringify(await ArticleModel.getArticleList(10)));

            for (let index in dataList) {
                if (dataList.hasOwnProperty(index)) {
                    let item = dataList[index];
                    if(item.article_cont.length > 320){
                        item.article_cont = item.article_cont.substr(0,300) + '...';
                    }
                    delete item['z_tags'];
                    delete item['z_user'];
                    item.detail_time = moment(item.create_time * 1000).format('YYYY年MM月DD日hh时mm分');
                    item.article_year = moment(item.create_time * 1000).format('YYYY年');
                    item.create_time = moment(item.create_time * 1000).format('MM月DD日');
                }
            }

            data = dataList.reduce((sum, cur) => {
                let index = cache[cur.article_year];
                if (index !== undefined) {
                    sum[index].push(cur)
                } else {
                    sum.push([cur]);
                    cache[cur.article_year] = sum.length - 1
                }
                return sum
            }, []);

            ctx.response.status = 200;
            ctx.body = {
                code: 200,
                msg: '查询成功',
                data
            }

        } catch (err) {
            ctx.response.status = 412;
            ctx.body = {
                code: 412,
                msg: '查询失败',
                err
            }
        }
    }
}

module.exports = ArchivesController;
