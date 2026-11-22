import { describe, expect, it } from 'vitest';
import { unreadCountsByRoom, withUnreadCounts } from './chatUnreadCounts';
import type { ListedChatRoom } from './chatRoomTree';

function listedRoom(id: string, name: string): ListedChatRoom {
	return { id, name, purpose: '', parentRoomId: null, isGeneral: false, isArchived: false, isSubroom: false };
}

const general = listedRoom('general', 'General');
const finance = listedRoom('finance', 'Finance');

describe('unread counts', () => {
	it('reads the database counts as numbers, however Postgres sends a bigint', () => {
		const counts = unreadCountsByRoom([
			{ room_id: 'general', unread_count: '3' },
			{ room_id: 'finance', unread_count: 12 }
		]);
		expect(counts.get('general')).toBe(3);
		expect(counts.get('finance')).toBe(12);
	});

	it('gives each room its count, and a room with nothing new a count of nothing', () => {
		const rooms = withUnreadCounts([general, finance], unreadCountsByRoom([{ room_id: 'finance', unread_count: '2' }]));
		expect(rooms.map((room) => [room.name, room.unreadCount])).toEqual([
			['General', 0],
			['Finance', 2]
		]);
	});

	it('keeps the rooms in the order they were listed', () => {
		const rooms = withUnreadCounts([finance, general], new Map());
		expect(rooms.map((room) => room.id)).toEqual(['finance', 'general']);
	});
});
