/**
 ├── controllers
 └── Tag.js
 */
const TagModel = require('../model/TagModel')
const ArticleModel = require('../model/ArticleModel')
const moment = require('moment')

class TagController {
    static async Tag(ctx){
        try {
            // 查询文章详情模型
            let data = await TagModel.getTagList();
            data.map((item) => {
                item.create_time = moment(item.create_time * 1000).format('YYYY年MM月DD日')
                item.update_time = moment(item.update_time * 1000).format('YYYY年MM月DD日')
            })
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

    static async TagToArticleList(ctx){
        let id = ctx.query.id;
        if (id) {
            try {
                // 查询文章详情模型
                let data = JSON.parse(JSON.stringify(await ArticleModel.getTagToArticleList(id)));
                data['z_articles'].forEach((item) => {
                    if(item.article_cont.length > 220){
                        item.article_cont = item.article_cont.substr(0,200) + '...';
                    }
                    item['user'] = item['z_user'];
                    delete item['z_user'];
                    item.detail_time = moment(item.create_time * 1000).format('YYYY年MM月DD日hh时mm分')
                    item.create_time = moment(item.create_time * 1000).format('YYYY年MM月DD日')
                })
                data['article_count'] = data['z_articles'].length
                data['articles'] = data['z_articles']
                delete data['z_articles'];

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
                msg: '标签ID必须传'
            }
        }
    }
}

module.exports = TagController