import { describe, expect, it, vi } from 'vitest';
import { readUnreadInEveryRoom } from './readUnreadInEveryRoom';
import type { SupabaseClient } from '@supabase/supabase-js';

const room = (id: string, unreadCount: number) => ({ id, name: id, purpose: '', parentRoomId: null, isGeneral: false, isArchived: false, isSubroom: false, unreadCount });
const listed = [room('general', 2), room('finance', 0), room('operations', 1)];

const { readingRoom } = vi.hoisted(() => ({ readingRoom: vi.fn() }));
vi.mock('./readChatRooms', () => ({ readChatRooms: async () => listed }));
vi.mock('./readChatUnreadCounts', () => ({ listChatRoomsForReader: async () => listed }));
vi.mock('./readChatRoomAsAsked', () => ({ readRoomForReader: readingRoom }));

describe('readUnreadInEveryRoom', () => {
	it('reads what is unread in each room with something new, in the order the rooms are listed', async () => {
		readingRoom.mockImplementation(async (_supabase, _reader, readRoom) => ({ room: readRoom, since: 'unread', entries: [], messagesLeftOut: 0 }));
		const readings = await readUnreadInEveryRoom({} as SupabaseClient, { organisationId: 'jewel', accountId: 'nigel' });
		expect(readings.map(({ room }) => room.id)).toEqual(['general', 'operations']);
		expect(readingRoom).toHaveBeenCalledWith({}, { organisationId: 'jewel', accountId: 'nigel' }, listed[0], listed, { since: 'unread', limit: 50 });
	});
});
