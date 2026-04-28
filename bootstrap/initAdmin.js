import UserModel from '../model/UserModel.js';
import SettingModel from '../model/SettingModel.js';
import CategoryModel from '../model/CategoryModel.js';
import { hashPassword, isPasswordHash } from '../utils/password.js';
import config from '../config/config.js';

export async function ensureAdminUser() {
const { username, password, nickname } = config.admin;

if (config.env === 'production') {
if (!process.env.JWT_SECRET) {
throw new Error('生产环境必须配置 JWT_SECRET');
}
if (!process.env.ADMIN_PASSWORD) {
throw new Error('生产环境必须配置 ADMIN_PASSWORD');
}
}

const existing = await UserModel.findAnyByUsername(username);
if (existing) {
const patch = {};
if (existing.status !== 1) patch.status = 1;
if (existing.role !== 'admin') patch.role = 'admin';
if (Object.keys(patch).length > 0) {
await UserModel.updateUser(existing.id, patch);
console.log(`[bootstrap] admin user "${username}" role/status repaired.`);
}
if (!isPasswordHash(existing.password)) {
await UserModel.updatePassword(existing.id, await hashPassword(existing.password));
console.log(`[bootstrap] admin user "${username}" password migrated to hash.`);
}
console.log(`[bootstrap] admin user "${username}" already exists, skip.`);
return existing;
}

if (!process.env.ADMIN_PASSWORD) {
console.warn('[bootstrap] 当前使用默认管理员密码，请在部署前配置 ADMIN_PASSWORD。');
}

const user = await UserModel.createUser({
username,
nickname: nickname || username,
password: await hashPassword(password),
role: 'admin',
});
console.log(`[bootstrap] created default admin user "${username}" (id=${user.id}).`);
return user;
}

export async function ensureDefaultSettings() {
const defaults = [
{ setting_key: 'site.name', setting_value: 'Love Admin', remark: '站点名称' },
{ setting_key: 'site.description', setting_value: '个人博客 CMS', remark: '站点描述' },
{ setting_key: 'site.keywords', setting_value: 'blog,cms', remark: '站点关键词' },
{ setting_key: 'site.logo', setting_value: '', remark: '站点 Logo' },
{ setting_key: 'site.banner', setting_value: '', remark: '站点 Banner' },
{ setting_key: 'site.og_image', setting_value: '', remark: '默认分享图' },
{ setting_key: 'site.icp', setting_value: '', remark: 'ICP备案号' },
];

for (const item of defaults) {
const existing = await SettingModel.raw.findOne({ where: { setting_key: item.setting_key } });
if (!existing) {
await SettingModel.upsertSetting({
...item,
value_type: 'string',
is_public: 1,
});
}
}
console.log('[bootstrap] default public settings ensured.');
}

export async function ensureDefaultCategory() {
const existing = await CategoryModel.raw.findOne({ where: { id: 1 } });
if (!existing) {
await CategoryModel.createCategory({
category_name: '默认分类',
category_slug: 'default',
description: '默认文章分类',
sort: 0,
status: 1,
});
console.log('[bootstrap] created default category (id=1).');
}
}