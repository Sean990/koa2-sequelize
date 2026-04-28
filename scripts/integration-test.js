import http from 'node:http';
import { rm } from 'node:fs/promises';
import path from 'node:path';
import app from '../app.js';
import config from '../config/config.js';
import { initDatabase, sequelize } from '../config/db.js';
import UserModel from '../model/UserModel.js';
import { hashPassword } from '../utils/password.js';

const marker = `codex_${Date.now()}`;
const username = `${marker}_admin`;
const password = 'Test123456';
const siteImageKeys = ['site.logo', 'site.banner', 'site.og_image'];
const localDatabaseHosts = new Set(['localhost', '127.0.0.1', '::1']);

let server;
let baseUrl;
let token;
let userId;
let categoryId;
let navId;
let tagId;
let articleId;
let friendLinkId;
let uploadUrl;
let settingId;
let siteImageSnapshotReady = false;
let siteImageStates = [];

function now() {
	return Math.floor(Date.now() / 1000);
}

function assertSafeIntegrationTarget() {
	const host = String(config.database.host || '').trim().toLowerCase();
	if (config.env === 'production') {
		throw new Error('集成测试禁止在生产环境运行');
	}
	if (!localDatabaseHosts.has(host)) {
		throw new Error(`集成测试禁止连接非本地数据库主机：${config.database.host}`);
	}
	console.log(`[integration] target database: ${config.database.user}@${config.database.host}:${config.database.port}/${config.database.dbName}`);
}

async function request(apiPath, options = {}) {
	const res = await fetch(`${baseUrl}${apiPath}`, {
		...options,
		headers: {
			'Content-Type': 'application/json',
			...(token ? { Authorization: `Bearer ${token}` } : {}),
			...(options.headers || {}),
		},
	});
	const text = await res.text();
	let body;
	try {
		body = text ? JSON.parse(text) : {};
	} catch {
		body = { raw: text };
	}
	if (res.status >= 400) {
		throw new Error(`${options.method || 'GET'} ${apiPath} -> ${res.status} ${JSON.stringify(body)}`);
	}
	return { status: res.status, body };
}

async function snapshotSetting(key) {
	const [rows] = await sequelize.query('SELECT * FROM cms_setting WHERE setting_key = ? LIMIT 1', {
		replacements: [key],
	});
	return rows[0] || null;
}

async function insertSettingPlaceholder(key) {
	const ts = now();
	const [result] = await sequelize.query(
		`INSERT INTO cms_setting (
			setting_key,
			setting_value,
			value_type,
			remark,
			is_public,
			create_time,
			update_time
		) VALUES (?, ?, ?, ?, ?, ?, ?)`,
		{
			replacements: [key, '', 'string', marker, 1, ts, ts],
		}
	);
	return result.insertId;
}

async function restoreSetting(row) {
	if (!row) return;
	await sequelize.query(
		`UPDATE cms_setting
		 SET setting_value = ?, value_type = ?, remark = ?, is_public = ?, update_time = ?
		 WHERE id = ?`,
		{
			replacements: [
				row.setting_value,
				row.value_type,
				row.remark,
				row.is_public,
				row.update_time,
				row.id,
			],
		}
	);
}

async function deletePlaceholderSetting({ key, placeholderId }) {
	if (!placeholderId) return;
	const [rows] = await sequelize.query('SELECT id, setting_key, remark FROM cms_setting WHERE id = ? LIMIT 1', {
		replacements: [placeholderId],
	});
	const current = rows[0];
	if (!current) return;
	if (current.setting_key !== key || current.remark !== marker) {
		console.warn(`[cleanup skipped] setting ${key} changed after test, placeholder id=${placeholderId}`);
		return;
	}
	await sequelize.query('DELETE FROM cms_setting WHERE id = ?', {
		replacements: [placeholderId],
	});
}

async function ensureSiteImageRows() {
	const states = [];
	for (const key of siteImageKeys) {
		const backup = await snapshotSetting(key);
		let placeholderId = null;
		if (!backup) {
			placeholderId = await insertSettingPlaceholder(key);
		}
		states.push({ key, backup, placeholderId });
	}
	siteImageStates = states;
	siteImageSnapshotReady = true;
}

async function cleanup() {
	try {
		if (articleId) await sequelize.query('DELETE FROM cms_article_tag WHERE article_id = ?', { replacements: [articleId] });
		if (articleId) await sequelize.query('DELETE FROM cms_article WHERE id = ?', { replacements: [articleId] });
		if (tagId) await sequelize.query('DELETE FROM cms_tag WHERE id = ?', { replacements: [tagId] });
		if (categoryId) await sequelize.query('DELETE FROM cms_category WHERE id = ?', { replacements: [categoryId] });
		if (navId) await sequelize.query('DELETE FROM cms_nav WHERE id = ?', { replacements: [navId] });
		if (friendLinkId) await sequelize.query('DELETE FROM cms_friendlink WHERE id = ?', { replacements: [friendLinkId] });
		if (settingId) await sequelize.query('DELETE FROM cms_setting WHERE id = ?', { replacements: [settingId] });
		if (siteImageSnapshotReady) {
			for (const state of siteImageStates) {
				if (state.backup) {
					await restoreSetting(state.backup);
				} else {
					await deletePlaceholderSetting(state);
				}
			}
		}
		if (userId) await sequelize.query('DELETE FROM cms_user WHERE id = ?', { replacements: [userId] });
		await sequelize.query('DELETE FROM cms_audit_log WHERE username = ? OR request_body LIKE ?', {
			replacements: [username, `%${marker}%`],
		});
		if (uploadUrl) {
			const relative = uploadUrl.replace(config.upload.urlPrefix, '').replace(/^\//, '');
			await rm(path.join(config.upload.dir, relative), { force: true });
		}
	} catch (err) {
		console.error('[cleanup failed]', err.message);
	}
}

async function main() {
	assertSafeIntegrationTarget();
	await initDatabase();
	const user = await UserModel.createUser({
		username,
		nickname: '接口验证管理员',
		password: await hashPassword(password),
		role: 'admin',
		status: 1,
	});
	userId = user.id;

	server = http.createServer(app.callback());
	await new Promise((resolve) => server.listen(0, resolve));
	baseUrl = `http://127.0.0.1:${server.address().port}/api/v1`;

	await request('/health');
	await request('/openapi.json');
	await request('/docs');
	await request('/docs/assets/swagger-ui.css');
	const login = await request('/auth/login', {
		method: 'POST',
		body: JSON.stringify({ username, password }),
	});
	token = login.body.data.token;
	await request('/auth/refresh', { method: 'POST' });
	await request('/auth/permissions?permission=article:write');

	const category = await request('/admin/categories', {
		method: 'POST',
		body: JSON.stringify({
			category_name: `${marker.slice(0, 18)}分类`,
			category_slug: marker,
		}),
	});
	categoryId = category.body.data.id;

	const navName = marker.slice(0, 20);
	const friendLinkTitle = marker.slice(0, 20);

	const tag = await request('/admin/tags', {
		method: 'POST',
		body: JSON.stringify({ tag_title: marker.slice(0, 20) }),
	});
	tagId = tag.body.data.id;

	await ensureSiteImageRows();

	const upload = await request('/admin/uploads/base64', {
		method: 'POST',
		body: JSON.stringify({
			mime: 'image/png',
			content: 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+/p9sAAAAASUVORK5CYII=',
		}),
	});
	uploadUrl = upload.body.data.url;

	const nav = await request('/admin/navs', {
		method: 'POST',
		body: JSON.stringify({
			nav_name: navName,
			nav_url: '/articles',
			target: '_self',
			nav_icon: uploadUrl,
			sort: 999999,
		}),
	});
	navId = nav.body.data.id;

	const friendLink = await request('/admin/friend_links', {
		method: 'POST',
		body: JSON.stringify({
			friendlink_title: friendLinkTitle,
			friendlink_url: 'https://example.com',
			friendlink_logo: uploadUrl,
		}),
	});
	friendLinkId = friendLink.body.data.id;

	const setting = await request('/admin/settings', {
		method: 'POST',
		body: JSON.stringify({
			setting_key: `${marker}.site_name`,
			setting_value: '接口验证站点',
			value_type: 'string',
			remark: marker,
			is_public: 1,
		}),
	});
	settingId = setting.body.data.id;

	for (const key of siteImageKeys) {
		await request('/admin/settings', {
			method: 'POST',
			body: JSON.stringify({
				setting_key: key,
				setting_value: uploadUrl,
				value_type: 'string',
				remark: marker,
				is_public: 1,
			}),
		});
	}

	const article = await request('/admin/articles', {
		method: 'POST',
		body: JSON.stringify({
			category_id: categoryId,
			article_title: `${marker} 文章`,
			article_cont: '这是一篇用于真实数据库接口验证的文章内容。',
			article_pic: uploadUrl,
			article_summary: '接口验证摘要',
			article_slug: marker,
			seo_title: '接口验证 SEO 标题',
			seo_keywords: 'cms,test',
			seo_description: '接口验证 SEO 描述',
			tag_ids: [tagId],
			status: 1,
			is_top: 1,
			is_recommend: 1,
			sort: 99,
		}),
	});
	articleId = article.body.data.id;

	await request(`/articles?page=1&pageSize=5&keyword=${encodeURIComponent(marker)}`);
	await request(`/article?id=${articleId}`);
	await request(`/article?slug=${marker}`);
	await request('/categories');

	const publicNavList = await request('/navs');
	if (!publicNavList.body.data.some((item) => item.id === navId && item.nav_icon === uploadUrl)) {
		throw new Error('公共导航接口未返回 nav_icon');
	}

	const publicFriendLinkList = await request('/friend_link');
	if (!publicFriendLinkList.body.data.some((item) => item.id === friendLinkId && item.friendlink_logo === uploadUrl)) {
		throw new Error('公共友链接口未返回 friendlink_logo');
	}

	const publicSettings = await request('/settings');
	for (const key of siteImageKeys) {
		if (publicSettings.body.data[key] !== uploadUrl) {
			throw new Error(`公共 settings 未返回 ${key}`);
		}
	}

	await request('/admin/settings?page=1&pageSize=5');

	const navList = await request(`/admin/navs?page=1&pageSize=5&keyword=${encodeURIComponent(navName)}`);
	if (!navList.body.data.rows.some((item) => item.id === navId && item.nav_icon === uploadUrl)) {
		throw new Error('nav_icon 未持久化');
	}

	const friendLinkList = await request(`/admin/friend_links?page=1&pageSize=5&keyword=${encodeURIComponent(friendLinkTitle)}`);
	if (!friendLinkList.body.data.rows.some((item) => item.id === friendLinkId && item.friendlink_logo === uploadUrl)) {
		throw new Error('friendlink_logo 未持久化');
	}

	const settingsMap = await request('/admin/settings/map');
	for (const key of siteImageKeys) {
		if (settingsMap.body.data[key] !== uploadUrl) {
			throw new Error(`${key} 未写入`);
		}
	}

	await request('/admin/articles?page=1&pageSize=5');
	await request('/admin/dashboard');
	await request('/admin/users?page=1&pageSize=5');
	await request(`/admin/audit_logs?page=1&pageSize=5&username=${encodeURIComponent(username)}&method=POST`);

	console.log(JSON.stringify({
		result: '真实数据库接口验证通过',
		articleId,
		categoryId,
		tagId,
		navId,
		friendLinkId,
		settingId,
		uploadUrl,
	}, null, 2));
}

try {
	await main();
} catch (err) {
	console.error(err);
	process.exitCode = 1;
} finally {
	await cleanup();
	if (server) await new Promise((resolve) => server.close(resolve));
	await sequelize.close();
}
