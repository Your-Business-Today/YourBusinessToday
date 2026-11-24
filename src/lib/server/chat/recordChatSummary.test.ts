import { beforeEach, describe, expect, it, vi } from 'vitest';
import { recordChatSummary } from './recordChatSummary';
import { chatMessageRefusals } from '$lib/data/chat/chatMessageRules';
import { chatSummaryRefusals } from '$lib/data/chat/chatSummaryRules';
import type { SupabaseClient } from '@supabase/supabase-js';

const finance = { id: 'finance', name: 'Finance', purpose: '', parentRoomId: null, isGeneral: false, isArchived: false };
const oldRoom = { ...finance, id: 'old', name: 'Old', isArchived: true };
vi.mock('./readChatRooms', () => ({ readChatRooms: async () => [finance, oldRoom] }));

const nigelOnJewel = { organisationId: 'jewel', accountId: 'nigel', postedVia: 'claude' as const };
const latestMessageAt = '2026-11-22T09:30:00.123456+00:00';
const written = { inserts: [] as Record<string, unknown>[], latest: null as string | null };

function serviceRole() {
	const latest = {
		select: () => latest,
		eq: () => latest,
		order: () => latest,
		limit: () => latest,
		maybeSingle: async () => ({ data: written.latest === null ? null : { created_at: written.latest }, error: null })
	};
	const inserting = (row: Record<string, unknown>) => {
		written.inserts.push(row);
		return { select: () => ({ single: async () => ({ data: { id: 's1', created_at: '2026-11-22T10:00:00Z', ...row }, error: null }) }) };
	};
	return { from: (table: string) => (table === 'chat_messages' ? latest : { insert: inserting }) } as unknown as SupabaseClient;
}

const record = (roomId: string, input: Record<string, unknown>) => recordChatSummary(serviceRole(), nigelOnJewel, roomId, input);

describe('recordChatSummary', () => {
	beforeEach(() => {
		Object.assign(written, { inserts: [], latest: latestMessageAt });
	});

	it('saves the catch-up for the room as written through the person’s Claude, covering up to the moment given', async () => {
		const saved = await record('finance', { words: ' Nigel paid the VAT. ', coversUpTo: latestMessageAt });
		expect(written.inserts).toEqual([
			{ organisation_id: 'jewel', room_id: 'finance', covers_up_to: latestMessageAt, words: 'Nigel paid the VAT.', written_by_account_id: 'nigel', written_via: 'claude' }
		]);
		expect(saved).toMatchObject({ id: 's1', roomId: 'finance', coversUpTo: latestMessageAt, writtenVia: 'claude' });
	});

	it('refuses a room of another organisation and an archived room, before reading it', async () => {
		expect(await record('elsewhere', { words: 'Done.', coversUpTo: latestMessageAt })).toBe(chatMessageRefusals.noSuchRoom);
		expect(await record('old', { words: 'Done.', coversUpTo: latestMessageAt })).toBe(chatMessageRefusals.archivedRoom);
		expect(written.inserts).toEqual([]);
	});

	it('refuses a moment later than the room’s latest message, and a room where nothing has been said', async () => {
		expect(await record('finance', { words: 'Done.', coversUpTo: '2026-11-22T09:31:00Z' })).toBe(chatSummaryRefusals.coversPastTheLatest);
		written.latest = null;
		expect(await record('finance', { words: 'Done.', coversUpTo: latestMessageAt })).toBe(chatSummaryRefusals.nothingSaid);
		expect(written.inserts).toEqual([]);
	});

	it('refuses words that do not fit and a moment that is no moment, before anything is read', async () => {
		expect(await record('finance', { words: '', coversUpTo: latestMessageAt })).toBe(chatSummaryRefusals.words);
		expect(await record('finance', { words: 'Done.', coversUpTo: 'this morning' })).toBe(chatSummaryRefusals.coversUpTo);
		expect(written.inserts).toEqual([]);
	});
});
