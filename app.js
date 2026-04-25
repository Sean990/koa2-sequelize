import path from 'node:path';
import Koa from 'koa';
import cors from 'koa2-cors';
import json from 'koa-json';
import onerror from 'koa-onerror';
import bodyparser from 'koa-bodyparser';
import logger from 'koa-logger';
import serve from 'koa-static';

import config from './config/config.js';
import index from './routes/index.js';
import catchError from './middlewres/exception.js';
import { rateLimit } from './middlewres/rateLimit.js';
import { requestLog } from './middlewres/requestLog.js';

const app = new Koa();

onerror(app);

app.use(catchError);
app.use(requestLog());
app.use(cors({
	origin: config.cors.origin,
	credentials: config.cors.credentials,
	allowMethods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
	allowHeaders: ['Content-Type', 'Authorization'],
}));
app.use(rateLimit());
app.use(bodyparser({
	enableTypes: ['json', 'form', 'text'],
	jsonLimit: config.bodyLimit,
	formLimit: config.bodyLimit,
	textLimit: config.bodyLimit,
}));
app.use(json());
app.use(logger());
app.use(serve(path.join(import.meta.dirname, 'public')));

app.use(async (ctx, next) => {
	const start = Date.now();
	await next();
	const ms = Date.now() - start;
	console.log(`${ctx.method} ${ctx.url} - ${ms}ms`);
});

app.use(index.routes(), index.allowedMethods());

app.on('error', (err, ctx) => {
	console.error('server error', err, ctx);
});

export default app;
