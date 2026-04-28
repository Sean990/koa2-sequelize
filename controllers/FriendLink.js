import FriendLinkModel from '../model/FriendLinkModel.js';
import { created, empty, success } from '../utils/response.js';
import { formatDate, toPlain } from '../utils/format.js';
import {
	normalizeStatus,
	optionalString,
	pagination,
	positiveInt,
	requireString,
	requireUrl,
} from '../utils/validators.js';
import { NotFound, ParameterException } from '../utils/http-exception.js';

function normalizeFriendLink(item) {
	const data = item.toJSON ? item.toJSON() : item;
	data.create_time = formatDate(data.create_time);
	data.update_time = formatDate(data.update_time);
	return data;
}

class FriendLinkController {
	static async FriendLink(ctx) {
		const data = toPlain(await FriendLinkModel.getFriendLinkList()).map(normalizeFriendLink);
		success(ctx, data, '查询成功');
	}

	static async adminList(ctx) {
		const { page, pageSize } = pagination(ctx.query, { defaultPageSize: 20 });
		const status = ctx.query.status === undefined || ctx.query.status === ''
			? undefined
			: normalizeStatus(ctx.query.status);
		const raw = await FriendLinkModel.getAdminFriendLinkList({
			page,
			pageSize,
			keyword: ctx.query.keyword,
			status,
		});
		const data = {
			...raw,
			rows: toPlain(raw.rows).map(normalizeFriendLink),
		};
		success(ctx, data, '查询成功');
	}

	static async create(ctx) {
		const body = ctx.request.body || {};
		const friendlink_url = requireUrl(body, 'friendlink_url', '友链地址');
		const friendlink_title = requireString(body, 'friendlink_title', '友链名称', { max: 60 });
		const friendlink_logo = optionalString(body, 'friendlink_logo', '友链 Logo', { max: 255 }) || '';
		const link = await FriendLinkModel.createFriendLink({ friendlink_url, friendlink_title, friendlink_logo });
		created(ctx, { id: link.id }, '创建成功');
	}

	static async update(ctx) {
		const id = positiveInt(ctx.params.id, '友链ID');
		const body = ctx.request.body || {};
		const payload = {};
		if (body.friendlink_url !== undefined) {
			payload.friendlink_url = requireUrl(body, 'friendlink_url', '友链地址');
		}
		if (body.friendlink_title !== undefined) {
			payload.friendlink_title = requireString(body, 'friendlink_title', '友链名称', { max: 60 });
		}
		if (body.friendlink_logo !== undefined) {
			payload.friendlink_logo = optionalString(body, 'friendlink_logo', '友链 Logo', { max: 255 }) || '';
		}
		if (body.status !== undefined) payload.status = normalizeStatus(body.status);
		if (Object.keys(payload).length === 0) throw new ParameterException('没有可更新的内容');
		const [affected] = await FriendLinkModel.updateFriendLink(id, payload);
		if (!affected) throw new NotFound('友链不存在');
		empty(ctx, '更新成功');
	}

	static async remove(ctx) {
		const id = positiveInt(ctx.params.id, '友链ID');
		const [affected] = await FriendLinkModel.deleteFriendLink(id);
		if (!affected) throw new NotFound('友链不存在');
		empty(ctx, '删除成功');
	}
}

export default FriendLinkController;
