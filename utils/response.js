export function success(ctx, data = null, msg = '操作成功') {
	ctx.status = 200;
	ctx.body = {
		code: 200,
		msg,
		data,
	};
}

export function created(ctx, data = null, msg = '创建成功') {
	ctx.status = 201;
	ctx.body = {
		code: 201,
		msg,
		data,
	};
}

export function empty(ctx, msg = '操作成功') {
	ctx.status = 200;
	ctx.body = {
		code: 200,
		msg,
	};
}
