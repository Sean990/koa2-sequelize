import path from 'node:path';
import { mkdir, writeFile } from 'node:fs/promises';
import { randomUUID } from 'node:crypto';
import config from '../config/config.js';
import { created } from '../utils/response.js';
import { ParameterException } from '../utils/http-exception.js';
import { requireString } from '../utils/validators.js';

const EXT_BY_MIME = {
	'image/jpeg': '.jpg',
	'image/png': '.png',
	'image/webp': '.webp',
	'image/gif': '.gif',
};

function parseUploadBody(body = {}) {
	let content = body.content;
	let mime = body.mime;
	if (body.dataUrl) {
		const match = String(body.dataUrl).match(/^data:([^;]+);base64,(.+)$/);
		if (!match) throw new ParameterException('dataUrl 格式不正确');
		mime = match[1];
		content = match[2];
	}
	requireString({ content }, 'content', '文件内容', { max: config.upload.maxSize * 2 });
	requireString({ mime }, 'mime', '文件类型', { max: 80 });
	if (!config.upload.allowedMimes.includes(mime)) {
		throw new ParameterException('不支持的文件类型');
	}
	const buffer = Buffer.from(content, 'base64');
	if (buffer.length === 0) throw new ParameterException('文件内容不能为空');
	if (buffer.length > config.upload.maxSize) {
		throw new ParameterException(`文件不能超过 ${Math.floor(config.upload.maxSize / 1024 / 1024)}MB`);
	}
	return { buffer, mime };
}

class UploadController {
	static async base64(ctx) {
		const { buffer, mime } = parseUploadBody(ctx.request.body || {});
		const now = new Date();
		const month = `${now.getFullYear()}/${String(now.getMonth() + 1).padStart(2, '0')}`;
		const relativeName = `${month}/${randomUUID()}${EXT_BY_MIME[mime] || ''}`;
		const uploadRoot = path.resolve(config.upload.dir);
		const fullPath = path.join(uploadRoot, relativeName);
		if (!fullPath.startsWith(uploadRoot)) {
			throw new ParameterException('文件路径非法');
		}
		await mkdir(path.dirname(fullPath), { recursive: true });
		await writeFile(fullPath, buffer);
		const url = `${config.upload.urlPrefix}/${relativeName.replace(/\\/g, '/')}`;
		created(ctx, {
			url,
			fullUrl: config.appUrl ? `${config.appUrl}${url}` : url,
			mime,
			size: buffer.length,
		}, '上传成功');
	}
}

export default UploadController;
