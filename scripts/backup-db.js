import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { sequelize } from '../config/db.js';

const TABLES = [
	'cms_user',
	'cms_article',
	'cms_tag',
	'cms_article_tag',
	'cms_category',
	'cms_nav',
	'cms_friendlink',
	'cms_setting',
	'cms_audit_log',
];

function timestamp() {
	const d = new Date();
	const pad = (num) => String(num).padStart(2, '0');
	return [
		d.getFullYear(),
		pad(d.getMonth() + 1),
		pad(d.getDate()),
		'-',
		pad(d.getHours()),
		pad(d.getMinutes()),
		pad(d.getSeconds()),
	].join('');
}

async function main() {
	await sequelize.authenticate();
	const out = {
		version: 1,
		created_at: new Date().toISOString(),
		tables: {},
	};

	for (const table of TABLES) {
		const [rows] = await sequelize.query(`SELECT * FROM ${table}`);
		out.tables[table] = rows;
	}

	const dir = path.resolve('backups');
	await mkdir(dir, { recursive: true });
	const file = path.join(dir, `cms-backup-${timestamp()}.json`);
	await writeFile(file, JSON.stringify(out, null, 2), 'utf8');
	await sequelize.close();
	console.log(`数据库备份已生成：${file}`);
}

try {
	await main();
} catch (err) {
	console.error('[backup] failed:', err);
	process.exit(1);
}
