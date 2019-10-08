
const router = require('koa-router')({
  prefix: '/api/v1'
})
// 引入控制器
const ArticleController = require('../controllers/Article')
const IndexController = require('../controllers/Index')
const TagController = require('../controllers/Tag')
const UserController = require('../controllers/User')
const FriendLinkController = require('../controllers/FriendLink')

/**
 * 公共接口
 */
router.get('/tag', TagController.Tag);
router.get('/user_list', UserController.UserList);
router.get('/user_info', UserController.UserInfo);
router.get('/friend_link', FriendLinkController.FriendLink);

/**
 * 首页接口
 */
router.get('/index', IndexController.Index);

/**
 * 文章接口
 */
// 创建文章接口（路由）
router.post('/article', ArticleController.create);
// 获取文章详情接口（路由）
router.get('/article/:id', ArticleController.detail);

module.exports = router
