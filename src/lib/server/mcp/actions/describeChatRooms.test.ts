import { describe, expect, it } from 'vitest';
import { describeChatRooms } from './describeChatRooms';
import type { ChatRoomWithUnread } from '$lib/data/chat/chatUnreadCounts';

const jewel = { id: 'jewel', name: 'Jewel' };

function listedRoom(id: string, name: string, fields: Partial<ChatRoomWithUnread> = {}): ChatRoomWithUnread {
	return { id, name, purpose: '', parentRoomId: null, isGeneral: false, isArchived: false, isSubroom: false, unreadCount: 0, ...fields };
}

describe('describeChatRooms', () => {
	it('lists each room with its id, what it is for and what is unread, a subroom beneath its room', () => {
		const rooms = [
			listedRoom('general', 'General', { purpose: 'Everything the whole organisation should hear.', isGeneral: true, unreadCount: 3 }),
			listedRoom('finance', 'Finance'),
			listedRoom('vat', 'VAT', { parentRoomId: 'finance', isSubroom: true, unreadCount: 1 })
		];
		expect(describeChatRooms(jewel, rooms)).toBe(
			[
				"Jewel's chat rooms, General first, each subroom beneath its room:",
				'- General, room general: Everything the whole organisation should hear. 3 unread.',
				'- Finance, room finance: Nothing unread.',
				'  - VAT, room vat: 1 unread.',
				'Read one room with read_chat_room, or everything new to you with read_chat_unread. Reading marks nothing read.'
			].join('\n')
		);
	});

	it('says plainly that no rooms are open yet, and where the first visit opens them', () => {
		const answer = describeChatRooms(jewel, []);
		expect(answer).toContain('Jewel has no chat rooms yet');
		expect(answer).toContain('/organisations/jewel/chat');
		expect(answer).toContain('reading them here opens none');
	});
});
