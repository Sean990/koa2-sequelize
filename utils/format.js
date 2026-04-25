import moment from 'moment';

export const now = () => Math.floor(Date.now() / 1000);

export function toPlain(data) {
	return JSON.parse(JSON.stringify(data));
}

export function formatDate(timestamp, pattern = 'YYYY年MM月DD日') {
	if (!timestamp) return '';
	return moment(Number(timestamp) * 1000).format(pattern);
}

export function formatDateTime(timestamp) {
	return formatDate(timestamp, 'YYYY年MM月DD日 HH时mm分');
}

export function excerpt(content = '', max = 300) {
	const text = String(content);
	if (text.length <= max + 20) return text;
	return `${text.slice(0, max)}...`;
}
