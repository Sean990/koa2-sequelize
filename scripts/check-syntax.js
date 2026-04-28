import { readdirSync, statSync } from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';

const root = path.join(import.meta.dirname, '..');
const ignoredDirs = new Set(['.git', 'node_modules', 'logs', 'public', 'backups']);
const files = [];

function walk(dir) {
	for (const entry of readdirSync(dir)) {
		const fullPath = path.join(dir, entry);
		const stat = statSync(fullPath);
		if (stat.isDirectory()) {
			if (!ignoredDirs.has(entry)) walk(fullPath);
			continue;
		}
		if (/\.(js|cjs)$/.test(entry)) files.push(fullPath);
	}
}

walk(root);
files.push(path.join(root, 'bin/www'));

let failed = false;
for (const file of files) {
	const result = spawnSync(process.execPath, ['--check', file], {
		encoding: 'utf8',
	});
	if (result.status !== 0) {
		failed = true;
		console.error(result.stderr || result.stdout);
	}
}

if (failed) {
	process.exitCode = 1;
} else {
	console.log(`语法检查通过：${files.length} 个文件`);
}
