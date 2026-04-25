import { createHmac, timingSafeEqual } from 'node:crypto';

const b64url = (buf) =>
	Buffer.from(buf).toString('base64').replace(/=+$/g, '').replace(/\+/g, '-').replace(/\//g, '_');

const b64urlDecode = (str) => {
	const pad = str.length % 4 === 0 ? '' : '='.repeat(4 - (str.length % 4));
	return Buffer.from(str.replace(/-/g, '+').replace(/_/g, '/') + pad, 'base64');
};

const sign = (data, secret) =>
	b64url(createHmac('sha256', secret).update(data).digest());

export function signToken(payload, secret, { expiresInSec = 60 * 60 * 24 * 7 } = {}) {
	const header = { alg: 'HS256', typ: 'JWT' };
	const now = Math.floor(Date.now() / 1000);
	const body = { iat: now, exp: now + expiresInSec, ...payload };
	const headerB64 = b64url(JSON.stringify(header));
	const bodyB64 = b64url(JSON.stringify(body));
	const sig = sign(`${headerB64}.${bodyB64}`, secret);
	return `${headerB64}.${bodyB64}.${sig}`;
}

export function verifyToken(token, secret) {
	if (!token || typeof token !== 'string') return null;
	const parts = token.split('.');
	if (parts.length !== 3) return null;
	const [headerB64, bodyB64, sig] = parts;
	const expected = sign(`${headerB64}.${bodyB64}`, secret);
	const a = Buffer.from(sig);
	const b = Buffer.from(expected);
	if (a.length !== b.length || !timingSafeEqual(a, b)) return null;
	try {
		const body = JSON.parse(b64urlDecode(bodyB64).toString('utf8'));
		if (body.exp && body.exp < Math.floor(Date.now() / 1000)) return null;
		return body;
	} catch {
		return null;
	}
}
