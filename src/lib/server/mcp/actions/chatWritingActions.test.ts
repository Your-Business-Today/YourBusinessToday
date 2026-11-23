import { beforeEach, describe, expect, it, vi } from 'vitest';
import { chatWritingActions } from './chatWritingActions';
import { moduleNotSwitchedOn } from '../organisationModuleGate';
import type { McpCaller } from '../resolveMcpCaller';
import { chatMessageLimits, chatMessageRefusals } from '$lib/data/chat/chatMessageRules';
import { chatMoveRefusals } from '$lib/data/chat/chatMoveRules';
import { chatDatabase, elsewhereRoomId, finance, forgetWhatWasWritten, general, jewel, messageId, nigelOnTheConnector, oldRoom } from './chatConnectorWorld.fixture';

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

const moveRow = { id: 'move', from_room_id: general.id, to_room_id: finance.id, moved_by: nigel.accountId, message_count: 1, moved_at: 'now' };

describe("a person's own Claude talking in the organisation's chat, through the connector", () => {
	beforeEach(() => {
		forgetWhatWasWritten();
		chat.switchedOn = ['chat'];
	});

	it('writes, in the chat area, for everyone', () => {
		for (const action of chatWritingActions) expect(action).toMatchObject({ area: 'chat', audience: 'everyone', isWrite: true, module: 'chat' });
	});

	it('posts as the caller through their Claude, and moves their place in the room as the site does', async () => {
		expect(await run('post_chat_message', { roomId: general.id, body: ' Morning, all. ' })).toContain(`message ${messageId}`);
		expect(chatDatabase.inserts[0].row).toMatchObject({ room_id: general.id, author_account_id: nigel.accountId, body: 'Morning, all.', posted_via: 'claude' });
		expect(chatDatabase.calls).toEqual([{ name: 'mark_chat_room_read', args: { reader: nigel.accountId, room: general.id } }]);
	});

	it('refuses words that do not fit by the field, a room archived and a room of another organisation', async () => {
		expect(await run('post_chat_message', { roomId: general.id, body: 'a'.repeat(chatMessageLimits.longestBody + 1) })).toBe(`body: ${chatMessageRefusals.body}`);
		expect(await run('post_chat_message', { roomId: general.id, body: 7 })).toBe(`body: ${chatMessageRefusals.body}`);
		expect(await run('post_chat_message', { roomId: oldRoom.id, body: 'Hello' })).toBe(chatMessageRefusals.archivedRoom);
		expect(await run('post_chat_message', { roomId: elsewhereRoomId, body: 'Hello' })).toContain('Call list_chat_rooms');
		expect(chatDatabase.inserts).toEqual([]);
	});

	it('moves the messages through the site’s move, with its refusals', async () => {
		chatDatabase.rpcAnswer = moveRow;
		expect(await run('move_chat_messages', { fromRoomId: general.id, toRoomId: finance.id, messageIds: [messageId] })).toContain('Moved 1 to Finance');
		expect(chatDatabase.calls[0]).toMatchObject({ name: 'move_chat_messages', args: { organisation: jewel.id, from_room: general.id, to_room: finance.id, mover: nigel.accountId } });
		expect(await run('move_chat_messages', { fromRoomId: general.id, toRoomId: oldRoom.id, messageIds: [messageId] })).toBe(chatMoveRefusals.destinationArchived);
		expect(await run('move_chat_messages', { fromRoomId: general.id, toRoomId: finance.id, messageIds: messageId })).toContain('messageIds is a list');
	});

	it('refuses a move to or from a room of another organisation', async () => {
		expect(await run('move_chat_messages', { fromRoomId: general.id, toRoomId: elsewhereRoomId, messageIds: [messageId] })).toContain('Call list_chat_rooms');
		chatDatabase.rpcRefusal = chatMoveRefusals.notInThisRoom;
		expect(await run('move_chat_messages', { fromRoomId: elsewhereRoomId, toRoomId: finance.id, messageIds: [messageId] })).toBe(chatMoveRefusals.notInThisRoom);
	});

	it('marks a room of the organisation read for the caller, and refuses one of another organisation', async () => {
		expect(await run('mark_chat_room_read', { roomId: finance.id })).toContain('Finance is marked read for you');
		expect(chatDatabase.calls).toEqual([{ name: 'mark_chat_room_read', args: { reader: nigel.accountId, room: finance.id } }]);
		expect(await run('mark_chat_room_read', { roomId: elsewhereRoomId })).toContain('Call list_chat_rooms');
		expect(chatDatabase.calls).toHaveLength(1);
	});

	it('writes nothing while Chat is not switched on for the organisation', async () => {
		chat.switchedOn = ['news'];
		const input = { roomId: general.id, body: 'Hello', fromRoomId: general.id, toRoomId: finance.id, messageIds: [messageId] };
		for (const action of chatWritingActions) expect(await run(action.name, input)).toBe(moduleNotSwitchedOn('chat'));
		expect(chatDatabase.inserts).toEqual([]);
		expect(chatDatabase.calls).toEqual([]);
	});
});
