//index.js
import Sequelize from 'sequelize'
import config from '../config/config.js'

// 实例化sequelize
export const sequelize = new Sequelize(config)

// 导入模型统一管理(推荐使用官方方法)
export const Article = sequelize.import(__dirname + '/z_article.js')
export const ArticleTag = sequelize.import(__dirname + '/z_article_tag.js')
export const FriendLink = sequelize.import(__dirname + '/z_friendlink.js')
export const Nav = sequelize.import(__dirname + '/z_nav.js')
export const Tag = sequelize.import(__dirname + '/z_tag.js')
export const User = sequelize.import(__dirname + '/z_user.js')
