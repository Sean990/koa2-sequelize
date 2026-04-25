import { randomBytes, scrypt, timingSafeEqual } from 'node:crypto';

const KEY_LEN = 32;
const SALT_LEN = 16;

const scryptAsync = (password, salt, keylen) =>
	new Promise((resolve, reject) => {
		scrypt(password, salt, keylen, (err, derivedKey) => {
			if (err) reject(err);
			else resolve(derivedKey);
		});
	});

function safeStringEqual(a, b) {
	const left = Buffer.from(String(a));
	const right = Buffer.from(String(b));
	return left.length === right.length && timingSafeEqual(left, right);
}

export function isPasswordHash(stored) {
	return typeof stored === 'string' && stored.startsWith('scrypt$');
}

export async function hashPassword(plain) {
	const salt = randomBytes(SALT_LEN);
	const hash = await scryptAsync(String(plain), salt, KEY_LEN);
	return `scrypt$${salt.toString('base64')}$${hash.toString('base64')}`;
}

export async function verifyPassword(plain, stored) {
	if (!stored || typeof stored !== 'string') return false;

	if (!isPasswordHash(stored)) {
		return safeStringEqual(plain, stored);
	}

	const parts = stored.split('$');
	if (parts.length !== 3) return false;
	const salt = Buffer.from(parts[1], 'base64');
	const expected = Buffer.from(parts[2], 'base64');
	const actual = await scryptAsync(String(plain), salt, expected.length);
	return actual.length === expected.length && timingSafeEqual(actual, expected);
}
