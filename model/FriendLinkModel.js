/**
 ├── modules
 └── FriendLinkModel.js
 */
const db = require('../config/db');
// 引入Sequelize对象
const Sequelize = db.sequelize;

// 引入上一步的文章数据表模型文件
const FriendLink = Sequelize.import('../schema/z_friendlink');

class FriendLinkModel {
    /**
     * 创建友情链接模型
     * @param data
     * @returns {Promise<*>}
     */
    static async createFriendLink(data) {
        return FriendLink.create({
            friendlink_url: data.friendlink_url,
            friendlink_title: data.friendlink_title,
            create_time: parseInt((new Date().getTime() / 1000).toString()),
            update_time: parseInt((new Date().getTime() / 1000).toString())
        });
    }

    /**
     * 查询友情链接列表
     * @returns {Promise<<Model[]>>}
     */
    static async getFriendLinkList() {
        return FriendLink.findAll({
            where: {status: 1},
            limit: 10
        })
    }
}

module.exports = FriendLinkModel
