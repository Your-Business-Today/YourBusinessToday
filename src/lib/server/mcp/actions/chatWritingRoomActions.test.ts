import { beforeEach, describe, expect, it, vi } from 'vitest';
import { chatWritingActions } from './chatWritingActions';
import type { McpCaller } from '../resolveMcpCaller';
import { chatRoomFieldRefusals, chatRoomLimits } from '$lib/data/chat/chatRoomRules';
import { chatRoomPlacementRefusals } from '$lib/data/chat/chatRoomPlacement';
import { chatWritingRefusals } from '$lib/data/chat/chatWritingRules';
import { chatDatabase, elsewhereRoomId, finance, forgetWhatWasWritten, general, jewel, nigelOnTheConnector, oldRoom } from './chatConnectorWorld.fixture';

vi.mock('$env/static/public', () => ({ PUBLIC_SUPABASE_URL: 'https://files.example/', PUBLIC_SUPABASE_PUBLISHABLE_KEY: 'a-publishable-key' }));
vi.mock('$env/dynamic/private', () => ({ env: {} }));
vi.mock('$env/dynamic/public', () => ({ env: {} }));

const { chat } = vi.hoisted(() => ({ chat: { switchedOn: [] as string[] } }));
vi.mock('$lib/server/organisations/getOrganisation', async () => {
	const { jewel: organisation } = await import('./chatConnectorWorld.fixture');
	return { getOrganisation: async (_supabase: unknown, organisationId: string) => (organisationId === organisation.id ? organisation : null) };
});
vi.mock('$lib/server/organisations/getSwitchedOnModules', () => ({ getSwitchedOnModules: async () => chat.switchedOn }));
vi.mock('$lib/server/chat/readChatRooms', async () => {
	const { jewelRooms } = await import('./chatConnectorWorld.fixture');
	return { readChatRooms: async () => jewelRooms };
});

const nigel = nigelOnTheConnector as unknown as McpCaller;

function run(name: string, input: Record<string, unknown>) {
	const action = chatWritingActions.find((candidate) => candidate.name === name);
	if (action === undefined) throw new Error(`No action named ${name}`);
	return action.run(nigel, { organisationId: jewel.id, ...input });
}

describe("a person's own Claude keeping the organisation's chat rooms, through the connector", () => {
	beforeEach(() => {
		forgetWhatWasWritten();
		chat.switchedOn = ['chat'];
	});

	it('opens a room as the site’s New does, refusing a name past its limit by the field', async () => {
		expect(await run('create_chat_room', { name: 'Estimating', purpose: 'Prices for tenders', parentRoomId: finance.id })).toContain('Estimating is open');
		expect(chatDatabase.inserts[0].row).toMatchObject({ organisation_id: jewel.id, created_by: nigel.accountId, name: 'Estimating', parent_room_id: finance.id });
		expect(await run('create_chat_room', { name: 'a'.repeat(chatRoomLimits.longestName + 1) })).toBe(`name: ${chatRoomFieldRefusals.name}`);
		expect(await run('create_chat_room', { name: 'Tenders', purpose: 7 })).toBe(`purpose: ${chatRoomFieldRefusals.purpose}`);
	});

	it('refuses to open a room under a room of another organisation', async () => {
		expect(await run('create_chat_room', { name: 'Estimating', parentRoomId: elsewhereRoomId })).toBe(chatRoomPlacementRefusals.parentNotListed);
		expect(chatDatabase.inserts).toEqual([]);
	});

	it('changes only the fields given, keeping the rest as the room has them', async () => {
		expect(await run('update_chat_room', { roomId: finance.id, purpose: 'The bank.' })).toContain('Finance is saved');
		expect(chatDatabase.updates[0].row).toEqual({ name: 'Finance', purpose: 'The bank.', parent_room_id: null });
	});

	it('archives through the site’s Archive, never General, and never brings a room back', async () => {
		expect(await run('update_chat_room', { roomId: finance.id, isArchived: true })).toContain('Finance is archived');
		expect(chatDatabase.updates[0].row).toHaveProperty('archived_at');
		expect(await run('update_chat_room', { roomId: general.id, isArchived: true })).toBe(chatRoomPlacementRefusals.generalIsNeverArchived);
		expect(await run('update_chat_room', { roomId: oldRoom.id, isArchived: false })).toBe(chatWritingRefusals.isArchived);
		expect(chatDatabase.updates).toHaveLength(1);
	});

	it('refuses a room of another organisation, and an archived one, changing nothing', async () => {
		expect(await run('update_chat_room', { roomId: elsewhereRoomId, name: 'Elsewhere' })).toContain('Call list_chat_rooms');
		expect(await run('update_chat_room', { roomId: elsewhereRoomId, isArchived: true })).toContain('Call list_chat_rooms');
		expect(await run('update_chat_room', { roomId: oldRoom.id, name: 'Older' })).toContain(chatRoomPlacementRefusals.roomNotListed);
		expect(chatDatabase.updates).toEqual([]);
	});

});
