import Router from '@koa/router';
import ArticleController from '../controllers/Article.js';
import ArchivesController from '../controllers/Archives.js';
import AuthController from '../controllers/Auth.js';
import AuditLogController from '../controllers/AuditLog.js';
import CategoryController from '../controllers/Category.js';
import FriendLinkController from '../controllers/FriendLink.js';
import IndexController from '../controllers/Index.js';
import NavController from '../controllers/Nav.js';
import TagController from '../controllers/Tag.js';
import UploadController from '../controllers/Upload.js';
import UserController from '../controllers/User.js';
import { auditLog } from '../middlewres/audit.js';
import { auth, requireRole } from '../middlewres/auth.js';
import { rateLimit } from '../middlewres/rateLimit.js';

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
router.get('/categories', CategoryController.list);
router.get('/navs', NavController.list);
router.get('/recent', IndexController.Recent);
router.get('/index', IndexController.Index);
router.get('/articles', ArticleController.list);
router.get('/article', ArticleController.detail);
router.get('/tag_to_article', TagController.TagToArticleList);
router.get('/archives', ArchivesController.Index);

router.post('/auth/login', rateLimit({ keyPrefix: 'login', max: 20 }), AuthController.login);
router.get('/auth/me', auth(), AuthController.me);
router.post('/auth/refresh', auth(), AuthController.refresh);

const admin = new Router({ prefix: '/admin' });
admin.use(auth());
admin.use(auditLog());

admin.get('/dashboard', requireRole('admin', 'editor'), IndexController.Dashboard);

admin.get('/articles', requireRole('admin', 'editor'), ArticleController.adminList);
admin.post('/articles', requireRole('admin', 'editor'), ArticleController.create);
admin.put('/articles/:id', requireRole('admin', 'editor'), ArticleController.update);
admin.delete('/articles/:id', requireRole('admin'), ArticleController.remove);

admin.get('/tags', requireRole('admin', 'editor'), TagController.adminList);
admin.post('/tags', requireRole('admin', 'editor'), TagController.create);
admin.put('/tags/:id', requireRole('admin', 'editor'), TagController.update);
admin.delete('/tags/:id', requireRole('admin'), TagController.remove);

admin.get('/categories', requireRole('admin', 'editor'), CategoryController.adminList);
admin.post('/categories', requireRole('admin', 'editor'), CategoryController.create);
admin.put('/categories/:id', requireRole('admin', 'editor'), CategoryController.update);
admin.delete('/categories/:id', requireRole('admin'), CategoryController.remove);

admin.get('/navs', requireRole('admin', 'editor'), NavController.adminList);
admin.post('/navs', requireRole('admin', 'editor'), NavController.create);
admin.put('/navs/:id', requireRole('admin', 'editor'), NavController.update);
admin.delete('/navs/:id', requireRole('admin'), NavController.remove);

admin.get('/friend_links', requireRole('admin', 'editor'), FriendLinkController.adminList);
admin.post('/friend_links', requireRole('admin', 'editor'), FriendLinkController.create);
admin.put('/friend_links/:id', requireRole('admin', 'editor'), FriendLinkController.update);
admin.delete('/friend_links/:id', requireRole('admin'), FriendLinkController.remove);

admin.get('/users', requireRole('admin'), UserController.adminList);
admin.post('/users', requireRole('admin'), UserController.create);
admin.put('/users/:id', requireRole('admin'), UserController.update);
admin.put('/users/:id/password', requireRole('admin'), UserController.updatePassword);
admin.delete('/users/:id', requireRole('admin'), UserController.remove);

admin.post('/uploads/base64', requireRole('admin', 'editor'), UploadController.base64);
admin.get('/audit_logs', requireRole('admin'), AuditLogController.list);

router.use(admin.routes(), admin.allowedMethods());

export default router;
