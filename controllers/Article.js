/**
 ├── controllers
 └── Article.js
 */
const ArticleModel = require('../model/ArticleModel')
const moment = require('moment')

class ArticleController {
    /**
     * 创建文章
     * @param ctx
     * @returns {Promise.<void>}
     */
    static async create(ctx) {
        // 接收客户端
        let req = ctx.request.body;
        if (req.article_title // 文章标题
            && req.user_id // 文章作者
            && req.article_cont // 文章内容
        ) {
            try {
                // 创建文章模型
                await ArticleModel.createArticle(req);

                ctx.response.status = 200;
                ctx.body = {
                    code: 200,
                    msg: '创建文章成功'
                }

            } catch (err) {
                ctx.response.status = 412;
                ctx.body = {
                    code: 200,
                    msg: '创建文章失败',
                    data: err
                }
            }
        } else {
            ctx.response.status = 416;
            ctx.body = {
                code: 200,
                msg: '参数不齐全',
            }
        }

    }

    /**
     * 获取文章详情
     * @param ctx
     * @returns {Promise.<void>}
     */
    static async detail(ctx) {
        let id = ctx.query.id;

        if (id) {
            try {
                // 查询文章详情模型
                let data = JSON.parse(JSON.stringify(await ArticleModel.getArticleDetail(id)));
                data['tags'] = data['z_tags'];
                data['user'] = data['z_user'];
                delete data['z_tags'];
                delete data['z_user'];
                data.detail_time = moment(data.create_time * 1000).format('YYYY年MM月DD日hh时mm分')
                data.create_time = moment(data.create_time * 1000).format('YYYY年MM月DD日')
                data.update_time = moment(data.update_time * 1000).format('YYYY年MM月DD日')
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
        } else {
            ctx.response.status = 416;
            ctx.body = {
                code: 416,
                msg: '文章ID必须传'
            }
        }
    }
}

module.exports = ArticleController;
