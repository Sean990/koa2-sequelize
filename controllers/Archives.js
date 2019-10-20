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
            let data = JSON.parse(JSON.stringify(await ArticleModel.getArticleList(10)));

            for (let index in data) {
                if (data.hasOwnProperty(index)) {
                    let item = data[index];
                    if(item.article_cont.length > 320){
                        item.article_cont = item.article_cont.substr(0,300) + '...';
                    }
                    item['tags'] = item['z_tags'];
                    item['user'] = item['z_user'];
                    delete item['z_tags'];
                    delete item['z_user'];
                    item.detail_time = moment(item.create_time * 1000).format('YYYY年MM月DD日hh时mm分')
                    item.create_time = moment(item.create_time * 1000).format('YYYY年MM月DD日')
                }
            }

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
