/**
 ├── controllers
 └── FriendLink.js
 */
const FriendLinkModel = require('../model/FriendLinkModel')
const moment = require('moment')

class FriendLinkController {
    static async FriendLink(ctx){
        try {
            // 查询文章详情模型
            let data = await FriendLinkModel.getFriendLinkList();
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
}

module.exports = FriendLinkController