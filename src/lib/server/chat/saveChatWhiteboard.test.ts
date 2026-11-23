import { beforeEach, describe, expect, it, vi } from 'vitest';
import { saveChatWhiteboard } from './saveChatWhiteboard';
import { chatWhiteboardRefusals } from '$lib/data/chat/chatWhiteboardRules';
import { chatMessageRefusals } from '$lib/data/chat/chatMessageRules';
import type { SupabaseClient } from '@supabase/supabase-js';

const finance = { id: 'finance', name: 'Finance', purpose: '', parentRoomId: null, isGeneral: false, isArchived: false };
const oldRoom = { ...finance, id: 'old', name: 'Old', isArchived: true };
const names: Record<string, string> = { james: 'James', sam: 'Sam' };
vi.mock('./readChatRooms', () => ({ readChatRooms: async () => [finance, oldRoom] }));
vi.mock('./nameChatWhiteboards', () => ({ nameWhiteboard: async (board: { lastSavedByAccountId: string }) => ({ ...board, lastSavedByName: names[board.lastSavedByAccountId] }) }));

const openedAt = '2026-11-23T13:30:00.123456+00:00';
const savedRow = { id: 'w1', room_id: 'finance', title: 'Plan', last_saved_by_account_id: 'james', created_by_account_id: 'james', created_at: openedAt, updated_at: openedAt, strokes: [] };
const world = { stored: savedRow, savedMeanwhile: null as typeof savedRow | null, updates: [] as { change: Record<string, unknown>; filters: [string, unknown][] }[] };

function serviceRole() {
	const reading = { select: () => reading, eq: () => reading, maybeSingle: async () => ({ data: world.stored, error: null }) };
	const updating = (change: Record<string, unknown>) => {
		const filters: [string, unknown][] = [];
		const chain = {
			eq: (column: string, value: unknown) => (filters.push([column, value]), chain),
			select: () => chain,
			maybeSingle: async () => {
				world.updates.push({ change, filters });
				if (world.savedMeanwhile !== null) return ((world.stored = world.savedMeanwhile), { data: null, error: null });
				return { data: { ...world.stored, ...change }, error: null };
			}
		};
		return chain;
	};
	return { from: () => ({ ...reading, update: updating }) } as unknown as SupabaseClient;
}

const jamesOnJewel = { organisationId: 'jewel', accountId: 'james' };
const asked = (roomId: string) => ({ organisationId: 'jewel', roomId, whiteboardId: 'w1' });
const line = { tool: 'pen', colour: 'red', width: 6, points: [[1, 1], [9, 9]] };
const given = { title: ' Kitchen ', strokes: JSON.stringify([line]), openedAsSavedAt: openedAt };
const save = (roomId: string, input: Record<string, unknown>) => saveChatWhiteboard(serviceRole(), jamesOnJewel, asked(roomId), input);

describe('saveChatWhiteboard', () => {
	beforeEach(() => Object.assign(world, { stored: savedRow, savedMeanwhile: null, updates: [] }));

	it('saves the title and drawing as the saver, only while the board is as they opened it', async () => {
		const saved = await save('finance', given);
		expect(world.updates).toHaveLength(1);
		expect(world.updates[0].change).toMatchObject({ title: 'Kitchen', strokes: [line], last_saved_by_account_id: 'james' });
		expect(world.updates[0].filters).toEqual([['id', 'w1'], ['organisation_id', 'jewel'], ['updated_at', openedAt]]);
		expect(saved).toMatchObject({ id: 'w1', title: 'Kitchen', lastSavedByName: 'James' });
	});

	it('refuses, naming who saved it and when, a board saved by someone else since it was opened, writing nothing', async () => {
		world.stored = { ...savedRow, last_saved_by_account_id: 'sam', updated_at: '2026-11-23T14:02:00Z' };
		expect(await save('finance', given)).toBe('Sam saved this board at 14:02. Open it again to carry on from theirs.');
		expect(world.updates).toEqual([]);
	});

	it('refuses the same way when someone saves it in the moment between reading and saving', async () => {
		world.savedMeanwhile = { ...savedRow, last_saved_by_account_id: 'sam', updated_at: '2026-11-23T14:05:00Z' };
		expect(await save('finance', given)).toBe('Sam saved this board at 14:05. Open it again to carry on from theirs.');
	});

	it('refuses an archived room, a room of another organisation and a board the room does not have', async () => {
		expect(await save('old', given)).toBe(chatWhiteboardRefusals.archivedRoom);
		expect(await save('elsewhere', given)).toBe(chatMessageRefusals.noSuchRoom);
		world.stored = null as unknown as typeof savedRow;
		expect(await save('finance', given)).toBe(chatWhiteboardRefusals.noSuchWhiteboard);
		expect(world.updates).toEqual([]);
	});

	it('refuses a drawing that does not fit before anything is read', async () => {
		expect(await save('finance', { ...given, strokes: JSON.stringify([{ ...line, colour: 'pink' }]) })).toContain('strokes[0].colour');
		expect(await save('finance', { ...given, title: '' })).toBe(chatWhiteboardRefusals.title);
		expect(world.updates).toEqual([]);
	});
});
