import Router from '@koa/router';
import ArticleController from '../controllers/Article.js';
import ArchivesController from '../controllers/Archives.js';
import AuthController from '../controllers/Auth.js';
import AuditLogController from '../controllers/AuditLog.js';
import CategoryController from '../controllers/Category.js';
import DocsController from '../controllers/Docs.js';
import FriendLinkController from '../controllers/FriendLink.js';
import IndexController from '../controllers/Index.js';
import NavController from '../controllers/Nav.js';
import SettingController from '../controllers/Setting.js';
import TagController from '../controllers/Tag.js';
import UploadController from '../controllers/Upload.js';
import UserController from '../controllers/User.js';
import { auditLog } from '../middlewres/audit.js';
import { auth, requirePermission, requireRole } from '../middlewres/auth.js';
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
router.get('/openapi.json', DocsController.openapi);
router.get('/docs', DocsController.ui);
router.get('/docs/assets/:file', DocsController.asset);

router.get('/tag_list', TagController.Tag);
router.get('/user_list', UserController.UserList);
router.get('/user_info', UserController.UserInfo);
router.get('/friend_link', FriendLinkController.FriendLink);
router.get('/categories', CategoryController.list);
router.get('/navs', NavController.list);
router.get('/settings', SettingController.publicMap);
router.get('/recent', IndexController.Recent);
router.get('/index', IndexController.Index);
router.get('/articles', ArticleController.list);
router.get('/article', ArticleController.detail);
router.get('/tag_to_article', TagController.TagToArticleList);
router.get('/archives', ArchivesController.Index);

router.post('/auth/login', rateLimit({ keyPrefix: 'login', max: 20 }), AuthController.login);
router.get('/auth/me', auth(), AuthController.me);
router.post('/auth/refresh', auth(), AuthController.refresh);
router.get('/auth/permissions', auth(), AuthController.permissions);

const admin = new Router({ prefix: '/admin' });
admin.use(auth());
admin.use(auditLog());

admin.get('/dashboard', requirePermission('dashboard:read'), IndexController.Dashboard);

admin.get('/articles', requirePermission('article:read'), ArticleController.adminList);
admin.post('/articles', requirePermission('article:write'), ArticleController.create);
admin['get']('/articles/:id', requirePermission('article:read'), ArticleController.adminDetail);
admin.put('/articles/:id', requirePermission('article:write'), ArticleController.update);
admin.delete('/articles/:id', requireRole('admin'), ArticleController.remove);

admin.get('/tags', requirePermission('tag:read'), TagController.adminList);
admin.post('/tags', requirePermission('tag:write'), TagController.create);
admin.put('/tags/:id', requirePermission('tag:write'), TagController.update);
admin.delete('/tags/:id', requireRole('admin'), TagController.remove);

admin.get('/categories', requirePermission('category:read'), CategoryController.adminList);
admin.post('/categories', requirePermission('category:write'), CategoryController.create);
admin.put('/categories/:id', requirePermission('category:write'), CategoryController.update);
admin.delete('/categories/:id', requireRole('admin'), CategoryController.remove);

admin.get('/navs', requirePermission('nav:read'), NavController.adminList);
admin.post('/navs', requirePermission('nav:write'), NavController.create);
admin.put('/navs/:id', requirePermission('nav:write'), NavController.update);
admin.delete('/navs/:id', requireRole('admin'), NavController.remove);

admin.get('/friend_links', requirePermission('friend_link:read'), FriendLinkController.adminList);
admin.post('/friend_links', requirePermission('friend_link:write'), FriendLinkController.create);
admin.put('/friend_links/:id', requirePermission('friend_link:write'), FriendLinkController.update);
admin.delete('/friend_links/:id', requireRole('admin'), FriendLinkController.remove);

admin.get('/settings', requireRole('admin'), SettingController.adminList);
admin.get('/settings/map', requireRole('admin'), SettingController.adminMap);
admin.post('/settings', requireRole('admin'), SettingController.upsert);
admin.put('/settings/:id', requireRole('admin'), SettingController.update);
admin.delete('/settings/:id', requireRole('admin'), SettingController.remove);

admin.get('/users', requireRole('admin'), UserController.adminList);
admin.post('/users', requireRole('admin'), UserController.create);
admin.put('/users/:id', requireRole('admin'), UserController.update);
admin.put('/users/:id/password', requireRole('admin'), UserController.updatePassword);
admin.delete('/users/:id', requireRole('admin'), UserController.remove);

admin.post('/uploads/base64', requirePermission('upload:write'), UploadController.base64);
admin.get('/audit_logs', requireRole('admin'), AuditLogController.list);

router.use(admin.routes(), admin.allowedMethods());

export default router;
