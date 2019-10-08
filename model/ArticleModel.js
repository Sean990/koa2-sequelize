/**
 ├── modules
 └── ArticleModel.js
 */
const db = require('../config/db');
// 引入Sequelize对象
const Sequelize = db.sequelize;

// 引入上一步的文章数据表模型文件
const Article = Sequelize.import('../schema/z_article');
const User = Sequelize.import('../schema/z_user');
const Tag = Sequelize.import('../schema/z_tag');
const ArticleTag = Sequelize.import('../schema/z_article_tag');

// user和article关系
User.hasMany(Article, {foreignKey: 'user_id', targetKey: 'id'});
Article.belongsTo(User, {foreignKey: 'user_id', targetKey: 'id'});

// article_tag和article关系
Article.belongsToMany(Tag, {
    through: {
        model: ArticleTag,
        unique: false,
    },
    foreignKey: 'article_id', //通过外键postId
    constraints: false
});
Tag.belongsToMany(Article, {
    through: {
        model: ArticleTag,
        unique: false,
    },
    foreignKey: 'tag_id', //通过外键tagId
    constraints: false
});

class ArticleModel {
    /**
     * 创建文章模型
     * @param data
     * @returns {Promise<*>}
     */
    static async createArticle(data) {
        return Article.create({
            article_title: data.article_title, // 文章标题
            user_id: data.user_id, // 文章作者
            article_cont: data.article_cont, // 文章内容
            create_time: parseInt((new Date().getTime() / 1000).toString()),
            update_time: parseInt((new Date().getTime() / 1000).toString())
        })
    }

    /**
     * 查询取文章详情
     * @param id  文章ID
     * @returns {Promise<<Model<T, T2> | null>>}
     */
    static async getArticleDetail(id) {
        return Article.findOne({
            where: {id}
        })
    }

    /**
     * 查询文章列表
     * @returns {Promise<<Model[]>>}
     */
    static async getArticleList() {
        return Article.findAll({
            order: [
                ['create_time', 'DESC'],
            ],
            attributes: ['id', 'article_title', 'article_pic', 'create_time', 'article_cont'],
            include: [{
                model: Tag,
                attributes: ['id', 'tag_title'],
                // where: {status: 1},
                through: {
                    // 指定中间表的属性，这里表示不需要任何中间表的属性
                    attributes: []
                }
            },{
                model: User,
                attributes: ['id', 'nickname', 'avatar'],
                where: {status: 1}
            }],
            limit: 10
        })
    }
}

module.exports = ArticleModel
