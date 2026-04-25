/**
 ├── modules
 └── TagModel.js
 */
const db = require('../config/db');
// 引入Sequelize对象
const Sequelize = db.sequelize;

// 引入上一步的文章数据表模型文件
const Tag = Sequelize.import('../schema/z_tag');

class TagModel {
    /**
     * 创建标签模型
     * @param data
     * @returns {Promise<*>}
     */
    static async createTag(data) {
        return Tag.create({
            tag_title: data.tag_title,
            create_time: parseInt((new Date().getTime() / 1000).toString()),
            update_time: parseInt((new Date().getTime() / 1000).toString())
        });
    }

    /**
     * 查询标签列表
     * @returns {Promise<<Model[]>>}
     */
    static async getTagList() {
        return Tag.findAll({
            where: {status: 1},
            limit: 10
        })
    }
}

module.exports = TagModel
