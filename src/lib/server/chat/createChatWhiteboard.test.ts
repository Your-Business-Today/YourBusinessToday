import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createChatWhiteboard } from './createChatWhiteboard';
import { chatWhiteboardRefusals } from '$lib/data/chat/chatWhiteboardRules';
import { chatMessageRefusals } from '$lib/data/chat/chatMessageRules';
import type { SupabaseClient } from '@supabase/supabase-js';

const finance = { id: 'finance', name: 'Finance', purpose: '', parentRoomId: null, isGeneral: false, isArchived: false };
const oldRoom = { ...finance, id: 'old', name: 'Old', isArchived: true };
vi.mock('./readChatRooms', () => ({ readChatRooms: async () => [finance, oldRoom] }));

const inserts: Record<string, unknown>[] = [];

function serviceRole() {
	const inserting = (row: Record<string, unknown>) => {
		inserts.push(row);
		const saved = { id: 'w1', created_at: '2026-11-23T10:00:00Z', updated_at: '2026-11-23T10:00:00Z', ...row };
		return { select: () => ({ single: async () => ({ data: saved, error: null }) }) };
	};
	return { from: () => ({ insert: inserting }) } as unknown as SupabaseClient;
}

const jamesOnJewel = { organisationId: 'jewel', accountId: 'james' };
const start = (roomId: string, input: Record<string, unknown>) => createChatWhiteboard(serviceRole(), jamesOnJewel, roomId, input);

describe('createChatWhiteboard', () => {
	beforeEach(() => inserts.splice(0));

	it('starts a blank board in the room, its starter its first saver', async () => {
		const started = await start('finance', { title: ' Kitchen layout ' });
		expect(inserts).toEqual([
			{ organisation_id: 'jewel', room_id: 'finance', title: 'Kitchen layout', strokes: [], last_saved_by_account_id: 'james', created_by_account_id: 'james' }
		]);
		expect(started).toMatchObject({ id: 'w1', roomId: 'finance', title: 'Kitchen layout', lastSavedByAccountId: 'james' });
	});

	it('refuses a title that does not fit, an archived room and a room of another organisation', async () => {
		expect(await start('finance', { title: '' })).toBe(chatWhiteboardRefusals.title);
		expect(await start('old', { title: 'Plan' })).toBe(chatWhiteboardRefusals.archivedRoom);
		expect(await start('elsewhere', { title: 'Plan' })).toBe(chatMessageRefusals.noSuchRoom);
		expect(inserts).toEqual([]);
	});
});
