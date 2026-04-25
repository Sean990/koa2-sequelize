
const router = require('koa-router')({
  prefix: '/api/v1'
})
// 引入控制器
const ArticleController = require('../controllers/Article')
const IndexController = require('../controllers')
const TagController = require('../controllers/Tag')
const UserController = require('../controllers/User')
const FriendLinkController = require('../controllers/FriendLink')
const ArchivesController = require('../controllers/Archives')

/**
 * 公共接口
 */
router.get('/tag_list', TagController.Tag);
router.get('/user_list', UserController.UserList);
router.get('/user_info', UserController.UserInfo);
router.get('/friend_link', FriendLinkController.FriendLink);
router.get('/recent', IndexController.Recent);

/**
 * 首页接口
 */
router.get('/index', IndexController.Index);

/**
 * 文章接口
 */
// 创建文章接口
router.post('/article', ArticleController.create);
// 获取文章详情接口
router.get('/article', ArticleController.detail);

/**
 * 标签接口
 */
// 根据标签获取文章列表接口
router.get('/tag_to_article', TagController.TagToArticleList);

/**
 * 文章归档接口
 */
router.get('/archives', ArchivesController.Index);

module.exports = router
