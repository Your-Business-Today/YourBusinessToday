import { beforeEach, describe, expect, it, vi } from 'vitest';
import { chatWritingActions } from './chatWritingActions';
import { moduleNotSwitchedOn } from '../organisationModuleGate';
import { chatMessageRefusals } from '$lib/data/chat/chatMessageRules';
import { chatSummaryRefusals } from '$lib/data/chat/chatSummaryRules';
import { elsewhereRoomId, finance, jewel, nigelOnTheConnector, oldRoom } from './chatConnectorWorld.fixture';
import type { McpCaller } from '../resolveMcpCaller';

vi.mock('$env/static/public', () => ({ PUBLIC_SUPABASE_URL: 'https://files.example/', PUBLIC_SUPABASE_PUBLISHABLE_KEY: 'a-publishable-key' }));
vi.mock('$env/dynamic/private', () => ({ env: {} }));
vi.mock('$env/dynamic/public', () => ({ env: {} }));

const { chat } = vi.hoisted(() => ({ chat: { switchedOn: [] as string[], inserts: [] as Record<string, unknown>[] } }));
vi.mock('$lib/server/organisations/getOrganisation', async () => {
	const { jewel: organisation } = await import('./chatConnectorWorld.fixture');
	return { getOrganisation: async (_supabase: unknown, organisationId: string) => (organisationId === organisation.id ? organisation : null) };
});
vi.mock('$lib/server/organisations/getSwitchedOnModules', () => ({ getSwitchedOnModules: async () => chat.switchedOn }));
vi.mock('$lib/server/chat/readChatRooms', async () => {
	const { jewelRooms } = await import('./chatConnectorWorld.fixture');
	return { readChatRooms: async () => jewelRooms };
});

const latestMessageAt = '2026-11-22T09:30:00.123456+00:00';
const latest = { select: () => latest, eq: () => latest, order: () => latest, limit: () => latest, maybeSingle: async () => ({ data: { created_at: latestMessageAt }, error: null }) };
const inserting = (row: Record<string, unknown>) => {
	chat.inserts.push(row);
	return { select: () => ({ single: async () => ({ data: { id: 's1', created_at: '2026-11-22T10:00:00Z', ...row }, error: null }) }) };
};
const database = { from: (table: string) => (table === 'chat_messages' ? latest : { insert: inserting }) };
const nigel = { ...nigelOnTheConnector, supabase: database } as unknown as McpCaller;

function record(input: Record<string, unknown>) {
	const action = chatWritingActions.find((candidate) => candidate.name === 'record_chat_summary');
	if (action === undefined) throw new Error('No action named record_chat_summary');
	return action.run(nigel, { organisationId: jewel.id, ...input });
}

describe("a person's own Claude saving a catch-up of a room, through the connector", () => {
	beforeEach(() => {
		chat.switchedOn = ['chat'];
		chat.inserts = [];
	});

	it('saves the catch-up as written by the caller through their Claude, and says it marked nothing read', async () => {
		const answer = await record({ roomId: finance.id, words: 'Nigel paid the VAT.', coversUpTo: latestMessageAt });
		expect(answer).toContain(`Catch-up s1 saved for room ${finance.id} of Jewel's chat`);
		expect(answer).toContain('Nothing was marked read and no one was told.');
		expect(chat.inserts[0]).toMatchObject({ room_id: finance.id, written_by_account_id: nigel.accountId, written_via: 'claude' });
	});

	it('refuses by the field what does not fit, an archived room and a room of another organisation', async () => {
		expect(await record({ roomId: finance.id, words: '', coversUpTo: latestMessageAt })).toBe(`words: ${chatSummaryRefusals.words}`);
		expect(await record({ roomId: finance.id, words: 'Done.', coversUpTo: '2026-11-22T09:31:00Z' })).toBe(`coversUpTo: ${chatSummaryRefusals.coversPastTheLatest}`);
		expect(await record({ roomId: oldRoom.id, words: 'Done.', coversUpTo: latestMessageAt })).toBe(chatMessageRefusals.archivedRoom);
		expect(await record({ roomId: elsewhereRoomId, words: 'Done.', coversUpTo: latestMessageAt })).toContain('Call list_chat_rooms');
		expect(chat.inserts).toEqual([]);
	});

	it('saves nothing while Chat is not switched on for the organisation', async () => {
		chat.switchedOn = ['news'];
		expect(await record({ roomId: finance.id, words: 'Done.', coversUpTo: latestMessageAt })).toBe(moduleNotSwitchedOn('chat'));
		expect(chat.inserts).toEqual([]);
	});
});
