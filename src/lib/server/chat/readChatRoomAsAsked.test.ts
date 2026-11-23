import { beforeEach, describe, expect, it, vi } from 'vitest';
import { readChatRoomAsAsked } from './readChatRoomAsAsked';
import { chatFlowKinds } from '$lib/data/chat/chatRoomFlow';
import { chatMessageRefusals } from '$lib/data/chat/chatMessageRules';
import { chatReadingRefusals } from '$lib/data/chat/chatReadingRules';
import type { SupabaseClient } from '@supabase/supabase-js';

const finance = { id: 'finance', name: 'Finance', purpose: '', parentRoomId: null, isGeneral: false, isArchived: true };
const said = (id: string, createdAt: string) => ({ kind: chatFlowKinds.message, key: id, moment: createdAt, message: { id, createdAt } });

const { flowOfRoom } = vi.hoisted(() => ({ flowOfRoom: vi.fn() }));
vi.mock('./readChatRooms', () => ({ readChatRooms: async () => [finance] }));
vi.mock('./readChatFlowOfRoom', () => ({ readChatFlowOfRoom: flowOfRoom }));

const nigelOnJewel = { organisationId: 'jewel', accountId: 'nigel' };

function serviceRoleHolding(unreadMessageIds: string[], readUpTo: string | null) {
	const unread = { eq: () => unread, order: () => unread, limit: async () => ({ data: unreadMessageIds.map((message_id) => ({ message_id })), error: null }) };
	const place = { select: () => place, eq: () => place, maybeSingle: async () => ({ data: readUpTo === null ? null : { read_up_to: readUpTo }, error: null }) };
	return { rpc: vi.fn(() => unread), from: vi.fn(() => place) };
}

describe('readChatRoomAsAsked', () => {
	beforeEach(() => {
		flowOfRoom.mockResolvedValue([said('m1', '2026-11-20T09:00:00Z'), said('m2', '2026-11-22T09:00:00Z')]);
	});

	it('gives what is new to the named reader by the one unread rule, and marks nothing read', async () => {
		const serviceRole = serviceRoleHolding(['m2'], '2026-11-21T00:00:00Z');
		const reading = await readChatRoomAsAsked(serviceRole as unknown as SupabaseClient, nigelOnJewel, 'finance', {});
		expect(serviceRole.rpc).toHaveBeenCalledWith('chat_unread_messages_for_reader', { organisation: 'jewel', reader: 'nigel' });
		expect(serviceRole.rpc).not.toHaveBeenCalledWith('mark_chat_room_read', expect.anything());
		expect(serviceRole.from).toHaveBeenCalledWith('chat_room_reads');
		expect(reading).toMatchObject({ room: finance, since: 'unread', messagesLeftOut: 0 });
		expect(typeof reading !== 'string' && reading.entries.map((entry) => entry.key)).toEqual(['m2']);
	});

	it('reads an archived room in full when everything is asked for, without asking what is unread', async () => {
		const serviceRole = serviceRoleHolding([], null);
		const reading = await readChatRoomAsAsked(serviceRole as unknown as SupabaseClient, nigelOnJewel, 'finance', { since: 'all', limit: 1 });
		expect(serviceRole.rpc).not.toHaveBeenCalled();
		expect(reading).toMatchObject({ since: 'all', messagesLeftOut: 1 });
	});

	it('refuses a room that is not the organisation’s, and a reading that does not fit, before reading the room', async () => {
		const serviceRole = serviceRoleHolding([], null) as unknown as SupabaseClient;
		expect(await readChatRoomAsAsked(serviceRole, nigelOnJewel, 'elsewhere', {})).toBe(chatMessageRefusals.noSuchRoom);
		expect(await readChatRoomAsAsked(serviceRole, nigelOnJewel, 'finance', { limit: 500 })).toBe(chatReadingRefusals.limit);
	});
});
