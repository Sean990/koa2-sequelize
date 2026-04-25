import { HttpException } from '../utils/http-exception.js';

const catchError = async (ctx, next) => {
	try {
		await next();
	} catch (error) {
		const isHttpException = error instanceof HttpException;
		const isDev = process.env.NODE_ENV !== 'production';

		if (isDev && !isHttpException) {
			console.error(error);
		}

		ctx.status = isHttpException ? error.code : 500;
		ctx.body = {
			code: ctx.status,
			msg: isHttpException ? error.msg : '服务器内部错误',
			error_code: isHttpException ? error.errorCode : 9999,
			request: `${ctx.method} ${ctx.path}`,
		};
	}
};

export default catchError;
