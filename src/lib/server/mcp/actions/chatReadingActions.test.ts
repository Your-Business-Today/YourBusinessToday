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

const { chat, listing, reading, catchingUp, decisionsOfRoom } = vi.hoisted(() => ({
	chat: { switchedOn: [] as string[] },
	listing: vi.fn(),
	reading: vi.fn(),
	catchingUp: vi.fn(),
	decisionsOfRoom: vi.fn()
}));
vi.mock('$lib/server/organisations/getOrganisation', () => ({
	getOrganisation: async (_supabase: unknown, organisationId: string) => (organisationId === 'jewel' ? jewel : null)
}));
vi.mock('$lib/server/organisations/getSwitchedOnModules', () => ({ getSwitchedOnModules: async () => chat.switchedOn }));
vi.mock('$lib/server/chat/readChatRooms', () => ({ readChatRooms: async () => [general] }));
vi.mock('$lib/server/chat/readChatUnreadCounts', () => ({ listChatRoomsForReader: listing }));
vi.mock('$lib/server/chat/readChatRoomAsAsked', () => ({ readChatRoomAsAsked: reading }));
vi.mock('$lib/server/chat/readUnreadInEveryRoom', () => ({ readUnreadInEveryRoom: catchingUp }));
vi.mock('$lib/server/chat/listChatDecisions', () => ({ listDecisionsOfRoom: decisionsOfRoom }));

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
		reading.mockResolvedValue({ room: general, since: 'unread', entries: [], messagesLeftOut: 0, latestSummary: null });
		catchingUp.mockResolvedValue([]);
		decisionsOfRoom.mockResolvedValue([]);
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

	it('names the room’s open decisions after its messages, and which wait on the caller', async () => {
		const { closedByNigel, waitingOnJames, waitingOnNigel } = await import('$lib/server/chat/chatDecisionsListed.fixture');
		decisionsOfRoom.mockResolvedValue([{ ...waitingOnNigel, waitingOnAccountId: nigel.accountId }, waitingOnJames, closedByNigel]);
		const answer = await run('read_chat_room', { roomId: 'general' });
		expect(decisionsOfRoom).toHaveBeenCalledWith(nigel.supabase, 'general', [general]);
		expect(answer).toContain(`Open decisions in this room: 2, raised from its messages; list_chat_decisions gives each in full:\n- Do we take the Leeds job? (decision ${waitingOnNigel.id}, waiting on you)\n- Which van do we buy? (decision ${waitingOnJames.id}, waiting on James)`);
		expect(answer).not.toContain('Renew the insurance?');
	});

	it('hands each file of a message a ten-minute link to fetch it through, signed by where it is kept', async () => {
		const plan = { id: 'f1', storagePath: 'jewel/nigel/u1/plan.pdf', fileName: 'plan.pdf', contentType: 'application/pdf', sizeBytes: 2048 };
		const message = { id: 'm1', roomId: 'general', authorAccountId: 'nigel', authorName: 'Nigel', body: '', postedVia: 'site', createdAt: '2026-11-22T09:00:00Z', movedByMoveId: null, movedHere: null, files: [plan] };
		reading.mockResolvedValue({ room: general, since: 'all', entries: [{ kind: 'message', key: 'm1', moment: message.createdAt, message }], messagesLeftOut: 0, latestSummary: null });
		const createSignedUrls = vi.fn(async () => ({ data: [{ path: plan.storagePath, signedUrl: 'https://files.example/plan', error: null }], error: null }));
		const signing = { ...nigel, supabase: { storage: { from: () => ({ createSignedUrls }) } } } as unknown as McpCaller;
		const action = chatReadingActions.find((candidate) => candidate.name === 'read_chat_room');
		const answer = await action?.run(signing, { organisationId: 'jewel', roomId: 'general', since: 'all' });
		expect(createSignedUrls).toHaveBeenCalledWith([plan.storagePath], 600, { download: true });
		expect(answer).toContain('  - plan.pdf, application/pdf, 2 KB: https://files.example/plan');
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
		expect(decisionsOfRoom).not.toHaveBeenCalled();
	});
});
