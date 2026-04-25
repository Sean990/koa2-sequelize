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

async function cleanup() {
	try {
		if (articleId) await sequelize.query('DELETE FROM cms_article_tag WHERE article_id = ?', { replacements: [articleId] });
		if (articleId) await sequelize.query('DELETE FROM cms_article WHERE id = ?', { replacements: [articleId] });
		if (tagId) await sequelize.query('DELETE FROM cms_tag WHERE id = ?', { replacements: [tagId] });
		if (categoryId) await sequelize.query('DELETE FROM cms_category WHERE id = ?', { replacements: [categoryId] });
		if (navId) await sequelize.query('DELETE FROM cms_nav WHERE id = ?', { replacements: [navId] });
		if (friendLinkId) await sequelize.query('DELETE FROM cms_friendlink WHERE id = ?', { replacements: [friendLinkId] });
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
	const login = await request('/auth/login', {
		method: 'POST',
		body: JSON.stringify({ username, password }),
	});
	token = login.body.data.token;
	await request('/auth/refresh', { method: 'POST' });

	const category = await request('/admin/categories', {
		method: 'POST',
		body: JSON.stringify({
			category_name: `${marker.slice(0, 18)}分类`,
			category_slug: marker,
		}),
	});
	categoryId = category.body.data.id;

	const tag = await request('/admin/tags', {
		method: 'POST',
		body: JSON.stringify({ tag_title: marker.slice(0, 20) }),
	});
	tagId = tag.body.data.id;

	const nav = await request('/admin/navs', {
		method: 'POST',
		body: JSON.stringify({
			nav_name: marker.slice(0, 20),
			nav_url: '/articles',
			target: '_self',
		}),
	});
	navId = nav.body.data.id;

	const friendLink = await request('/admin/friend_links', {
		method: 'POST',
		body: JSON.stringify({
			friendlink_title: marker.slice(0, 20),
			friendlink_url: 'https://example.com',
		}),
	});
	friendLinkId = friendLink.body.data.id;

	const upload = await request('/admin/uploads/base64', {
		method: 'POST',
		body: JSON.stringify({
			mime: 'image/png',
			content: 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+/p9sAAAAASUVORK5CYII=',
		}),
	});
	uploadUrl = upload.body.data.url;

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
	await request('/navs');
	await request('/admin/articles?page=1&pageSize=5');
	await request('/admin/dashboard');
	await request('/admin/users?page=1&pageSize=5');
	await request('/admin/audit_logs?page=1&pageSize=5');

	console.log(JSON.stringify({
		result: '真实数据库接口验证通过',
		articleId,
		categoryId,
		tagId,
		navId,
		friendLinkId,
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
