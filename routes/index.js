import Router from '@koa/router';
import ArticleController from '../controllers/Article.js';
import ArchivesController from '../controllers/Archives.js';
import AuthController from '../controllers/Auth.js';
import FriendLinkController from '../controllers/FriendLink.js';
import IndexController from '../controllers/Index.js';
import TagController from '../controllers/Tag.js';
import UserController from '../controllers/User.js';
import { auth, requireRole } from '../middlewres/auth.js';

const router = new Router({ prefix: '/api/v1' });

router.get('/health', (ctx) => {
	ctx.body = {
		code: 200,
		msg: '服务正常',
		data: {
			uptime: process.uptime(),
			timestamp: Date.now(),
		},
	};
});

router.get('/tag_list', TagController.Tag);
router.get('/user_list', UserController.UserList);
router.get('/user_info', UserController.UserInfo);
router.get('/friend_link', FriendLinkController.FriendLink);
router.get('/recent', IndexController.Recent);
router.get('/index', IndexController.Index);
router.get('/articles', ArticleController.list);
router.get('/article', ArticleController.detail);
router.get('/tag_to_article', TagController.TagToArticleList);
router.get('/archives', ArchivesController.Index);

router.post('/auth/login', AuthController.login);
router.get('/auth/me', auth(), AuthController.me);

const admin = new Router({ prefix: '/admin' });
admin.use(auth());

admin.get('/dashboard', requireRole('admin', 'editor'), IndexController.Dashboard);

admin.get('/articles', requireRole('admin', 'editor'), ArticleController.adminList);
admin.post('/articles', requireRole('admin', 'editor'), ArticleController.create);
admin.put('/articles/:id', requireRole('admin', 'editor'), ArticleController.update);
admin.delete('/articles/:id', requireRole('admin'), ArticleController.remove);

admin.get('/tags', requireRole('admin', 'editor'), TagController.adminList);
admin.post('/tags', requireRole('admin', 'editor'), TagController.create);
admin.put('/tags/:id', requireRole('admin', 'editor'), TagController.update);
admin.delete('/tags/:id', requireRole('admin'), TagController.remove);

admin.get('/friend_links', requireRole('admin', 'editor'), FriendLinkController.adminList);
admin.post('/friend_links', requireRole('admin', 'editor'), FriendLinkController.create);
admin.put('/friend_links/:id', requireRole('admin', 'editor'), FriendLinkController.update);
admin.delete('/friend_links/:id', requireRole('admin'), FriendLinkController.remove);

admin.get('/users', requireRole('admin'), UserController.adminList);
admin.post('/users', requireRole('admin'), UserController.create);
admin.put('/users/:id', requireRole('admin'), UserController.update);
admin.put('/users/:id/password', requireRole('admin'), UserController.updatePassword);
admin.delete('/users/:id', requireRole('admin'), UserController.remove);

router.use(admin.routes(), admin.allowedMethods());

export default router;
