class HttpException extends Error {
	constructor(msg = '服务器异常', errorCode = 10000, code = 400) {
		super(msg);
		this.name = this.constructor.name;
		this.errorCode = errorCode;
		this.code = code;
		this.msg = msg;
	}
}

class ParameterException extends HttpException {
	constructor(msg = '参数错误', errorCode = 10000) {
		super(msg, errorCode, 400);
	}
}

class AuthFailed extends HttpException {
	constructor(msg = '授权失败', errorCode = 10004) {
		super(msg, errorCode, 401);
	}
}

class NotFound extends HttpException {
	constructor(msg = '资源不存在', errorCode = 10005) {
		super(msg, errorCode, 404);
	}
}

class Forbidden extends HttpException {
	constructor(msg = '禁止访问', errorCode = 10006) {
		super(msg, errorCode, 403);
	}
}

class Existing extends HttpException {
	constructor(msg = '资源已存在', errorCode = 10007) {
		super(msg, errorCode, 412);
	}
}

export {
	HttpException,
	ParameterException,
	AuthFailed,
	NotFound,
	Forbidden,
	Existing,
};
