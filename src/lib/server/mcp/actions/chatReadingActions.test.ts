import { beforeEach, describe, expect, it, vi } from 'vitest';
import { chatReadingActions } from './chatReadingActions';
import { moduleNotSwitchedOn } from '../organisationModuleGate';
import { chatMessageRefusals } from '$lib/data/chat/chatMessageRules';
import type { McpCaller } from '../resolveMcpCaller';

vi.mock('$env/static/public', () => ({ PUBLIC_SUPABASE_URL: 'https://files.example/', PUBLIC_SUPABASE_PUBLISHABLE_KEY: 'a-publishable-key' }));
vi.mock('$env/dynamic/private', () => ({ env: {} }));
vi.mock('$env/dynamic/public', () => ({ env: {} }));

const jewel = { id: 'jewel', name: 'Jewel' };
const general = { id: 'general', name: 'General', purpose: '', parentRoomId: null, isGeneral: true, isArchived: false };

const { chat, listing, reading, catchingUp } = vi.hoisted(() => ({
	chat: { switchedOn: [] as string[] },
	listing: vi.fn(),
	reading: vi.fn(),
	catchingUp: vi.fn()
}));
vi.mock('$lib/server/organisations/getOrganisation', () => ({
	getOrganisation: async (_supabase: unknown, organisationId: string) => (organisationId === 'jewel' ? jewel : null)
}));
vi.mock('$lib/server/organisations/getSwitchedOnModules', () => ({ getSwitchedOnModules: async () => chat.switchedOn }));
vi.mock('$lib/server/chat/readChatRooms', () => ({ readChatRooms: async () => [general] }));
vi.mock('$lib/server/chat/readChatUnreadCounts', () => ({ listChatRoomsForReader: listing }));
vi.mock('$lib/server/chat/readChatRoomAsAsked', () => ({ readChatRoomAsAsked: reading }));
vi.mock('$lib/server/chat/readUnreadInEveryRoom', () => ({ readUnreadInEveryRoom: catchingUp }));

const nigel = { accountId: 'nigel', isStaff: false, organisationMemberships: [{ organisationId: 'jewel', accountId: 'nigel', isManager: false }] } as McpCaller;
const nigelOnJewel = { accountId: 'nigel', organisationId: 'jewel' };

function run(name: string, input: Record<string, unknown>) {
	const action = chatReadingActions.find((candidate) => candidate.name === name);
	if (action === undefined) throw new Error(`No action named ${name}`);
	return action.run(nigel, { organisationId: 'jewel', ...input });
}

describe("a person's own Claude reading the organisation's chat, through the connector", () => {
	beforeEach(() => {
		vi.clearAllMocks();
		chat.switchedOn = ['chat'];
		listing.mockResolvedValue([{ ...general, isSubroom: false, unreadCount: 2 }]);
		reading.mockResolvedValue({ room: general, since: 'unread', entries: [], messagesLeftOut: 0 });
		catchingUp.mockResolvedValue([]);
	});

	it('only reads, in an area of its own, for everyone', () => {
		for (const action of chatReadingActions) expect(action).toMatchObject({ area: 'chat', audience: 'everyone', isWrite: false, module: 'chat' });
	});

	it('lists the rooms with what is unread for the caller', async () => {
		expect(await run('list_chat_rooms', {})).toContain('- General, room general: 2 unread.');
		expect(listing).toHaveBeenCalledWith(nigel.supabase, nigelOnJewel, [general]);
	});

	it('reads one room as the caller, and points a room of another organisation at the list', async () => {
		expect(await run('read_chat_room', { roomId: 'general', since: 'all' })).toContain('Nothing is new to you here');
		expect(reading).toHaveBeenCalledWith(nigel.supabase, nigelOnJewel, 'general', expect.objectContaining({ since: 'all' }));
		reading.mockResolvedValue(chatMessageRefusals.noSuchRoom);
		expect(await run('read_chat_room', { roomId: 'elsewhere' })).toContain('Call list_chat_rooms');
	});

	it('says in one line when nothing is unread anywhere', async () => {
		expect(await run('read_chat_unread', {})).toBe("Nothing is unread in Jewel's chat.");
		expect(catchingUp).toHaveBeenCalledWith(nigel.supabase, nigelOnJewel);
	});

	it('reads nothing while Chat is not switched on for the organisation', async () => {
		chat.switchedOn = ['news'];
		for (const action of chatReadingActions) expect(await run(action.name, { roomId: 'general' })).toBe(moduleNotSwitchedOn('chat'));
		expect(listing).not.toHaveBeenCalled();
		expect(reading).not.toHaveBeenCalled();
		expect(catchingUp).not.toHaveBeenCalled();
	});
});
