import { readFileSync } from 'node:fs';
import path from 'node:path';

const root = path.join(import.meta.dirname, '..');
const routesSource = readFileSync(path.join(root, 'routes/index.js'), 'utf8');
const openapi = JSON.parse(readFileSync(path.join(root, 'docs/openapi.json'), 'utf8'));

const actual = [];
for (const line of routesSource.split(/\r?\n/)) {
	const match = line.match(/^\s*(router|admin)\.(get|post|put|delete|patch)\('([^']+)'/);
	if (!match) continue;

	let routePath = match[3].replace(/:([A-Za-z0-9_]+)/g, '{$1}');
	if (match[1] === 'admin') routePath = `/admin${routePath}`;
	actual.push(`${match[2].toUpperCase()} ${routePath}`);
}

const documented = [];
for (const [routePath, methods] of Object.entries(openapi.paths || {})) {
	for (const method of Object.keys(methods)) {
		documented.push(`${method.toUpperCase()} ${routePath}`);
	}
}

const documentedSet = new Set(documented);
const actualSet = new Set(actual);
const missing = actual.filter((route) => !documentedSet.has(route));
const stale = documented.filter((route) => !actualSet.has(route));

if (missing.length || stale.length) {
	if (missing.length) {
		console.error('OpenAPI 缺少以下实际路由：');
		for (const route of missing) console.error(`- ${route}`);
	}
	if (stale.length) {
		console.error('OpenAPI 包含以下不存在路由：');
		for (const route of stale) console.error(`- ${route}`);
	}
	process.exit(1);
}

console.log(`OpenAPI 路由检查通过：${actual.length} 个路由`);
