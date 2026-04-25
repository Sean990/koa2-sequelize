import { createReadStream } from 'node:fs';
import { readFile } from 'node:fs/promises';
import { createRequire } from 'node:module';
import path from 'node:path';
import { ParameterException } from '../utils/http-exception.js';

let cache = null;
const require = createRequire(import.meta.url);
const swaggerUiDist = require('swagger-ui-dist');
const swaggerRoot = swaggerUiDist.getAbsoluteFSPath();

const CONTENT_TYPES = {
	'.css': 'text/css; charset=utf-8',
	'.js': 'application/javascript; charset=utf-8',
	'.png': 'image/png',
	'.html': 'text/html; charset=utf-8',
	'.map': 'application/json; charset=utf-8',
};

function swaggerHtml() {
	return `<!doctype html>
<html lang="zh-CN">
<head>
	<meta charset="utf-8">
	<meta name="viewport" content="width=device-width, initial-scale=1">
	<title>Love Admin CMS API</title>
	<link rel="stylesheet" href="/api/v1/docs/assets/swagger-ui.css">
	<link rel="icon" href="/api/v1/docs/assets/favicon-32x32.png">
	<style>
		body { margin: 0; background: #f6f8fa; }
		.swagger-ui .topbar { display: none; }
	</style>
</head>
<body>
	<div id="swagger-ui"></div>
	<script src="/api/v1/docs/assets/swagger-ui-bundle.js"></script>
	<script src="/api/v1/docs/assets/swagger-ui-standalone-preset.js"></script>
	<script>
		window.onload = () => {
			window.ui = SwaggerUIBundle({
				url: '/api/v1/openapi.json',
				dom_id: '#swagger-ui',
				deepLinking: true,
				presets: [
					SwaggerUIBundle.presets.apis,
					SwaggerUIStandalonePreset
				],
				layout: 'StandaloneLayout',
				docExpansion: 'none',
				defaultModelsExpandDepth: 1,
				persistAuthorization: true
			});
		};
	</script>
</body>
</html>`;
}

class DocsController {
	static async openapi(ctx) {
		if (!cache) {
			const file = path.join(process.cwd(), 'docs/openapi.json');
			cache = JSON.parse(await readFile(file, 'utf8'));
		}
		ctx.status = 200;
		ctx.body = cache;
	}

	static async ui(ctx) {
		ctx.status = 200;
		ctx.type = 'html';
		ctx.body = swaggerHtml();
	}

	static async asset(ctx) {
		const file = path.basename(ctx.params.file || '');
		if (!file) throw new ParameterException('资源路径不能为空');
		const fullPath = path.join(swaggerRoot, file);
		if (!fullPath.startsWith(swaggerRoot)) {
			throw new ParameterException('资源路径非法');
		}
		ctx.status = 200;
		ctx.type = CONTENT_TYPES[path.extname(file)] || 'application/octet-stream';
		ctx.body = createReadStream(fullPath);
	}
}

export default DocsController;
