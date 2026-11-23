import { beforeEach, describe, expect, it, vi } from 'vitest';
import { chatDecisionActions } from './chatDecisionActions';
import { moduleNotSwitchedOn } from '../organisationModuleGate';
import { chatDecisionLimits, chatDecisionListingRefusals, chatDecisionRefusals } from '$lib/data/chat/chatDecisionRules';
import { closedByNigel, waitingOnJames, waitingOnNigel } from '$lib/server/chat/chatDecisionsListed.fixture';
import type { McpCaller } from '../resolveMcpCaller';

vi.mock('$env/static/public', () => ({ PUBLIC_SUPABASE_URL: 'https://files.example/', PUBLIC_SUPABASE_PUBLISHABLE_KEY: 'a-publishable-key' }));
vi.mock('$env/dynamic/private', () => ({ env: {} }));
vi.mock('$env/dynamic/public', () => ({ env: {} }));

const { chat, raising, closing } = vi.hoisted(() => ({ chat: { switchedOn: [] as string[] }, raising: vi.fn(), closing: vi.fn() }));
vi.mock('$lib/server/organisations/getOrganisation', () => ({
	getOrganisation: async (_supabase: unknown, organisationId: string) => (organisationId === 'jewel' ? { id: 'jewel', name: 'Jewel' } : null)
}));
vi.mock('$lib/server/organisations/getSwitchedOnModules', () => ({ getSwitchedOnModules: async () => chat.switchedOn }));
vi.mock('$lib/server/chat/listChatDecisions', () => ({ listDecisionsOfOrganisation: async () => [waitingOnNigel, waitingOnJames, closedByNigel] }));
vi.mock('$lib/server/chat/readChatRooms', () => ({ readChatRooms: async () => [] }));
vi.mock('$lib/server/chat/raiseChatDecision', async (actual) => {
	const service = await actual<typeof import('$lib/server/chat/raiseChatDecision')>();
	return { raiseChatDecision: raising.mockImplementation(service.raiseChatDecision) };
});
vi.mock('$lib/server/chat/closeChatDecision', async (actual) => {
	const service = await actual<typeof import('$lib/server/chat/closeChatDecision')>();
	return { closeChatDecision: closing.mockImplementation(service.closeChatDecision) };
});

const nigelOnJewel = { organisationId: 'jewel', accountId: waitingOnNigel.waitingOnAccountId };
const nigel = { accountId: nigelOnJewel.accountId, isStaff: false, supabase: {}, organisationMemberships: [{ ...nigelOnJewel, isManager: false }] };

function run(name: string, input: Record<string, unknown>) {
	const action = chatDecisionActions.find((candidate) => candidate.name === name);
	if (action === undefined) throw new Error(`No action named ${name}`);
	return action.run(nigel as unknown as McpCaller, { organisationId: 'jewel', ...input });
}

const raisingInput = { roomId: waitingOnNigel.roomId, messageId: waitingOnNigel.messageId, wording: 'Do we take the Leeds job?', waitingOn: 'Nigel' };

describe("a person's own Claude raising, closing and listing the chat's decisions, through the connector", () => {
	beforeEach(() => {
		vi.clearAllMocks();
		chat.switchedOn = ['chat'];
	});

	it('lists only by reading, and raises and closes by writing, in the chat area for everyone', () => {
		const writes = chatDecisionActions.map((action) => [action.name, action.isWrite]);
		expect(writes).toEqual([['list_chat_decisions', false], ['raise_chat_decision', true], ['close_chat_decision', true]]);
		for (const action of chatDecisionActions) expect(action).toMatchObject({ area: 'chat', audience: 'everyone', module: 'chat' });
	});

	it('lists the decisions open first, marking the ones that wait on the caller', async () => {
		const answer = await run('list_chat_decisions', {});
		expect(answer).toContain('open first, newest raised first, then closed, latest closed first. Waiting on you: 1 of them');
		expect(answer).toContain(`- Decision ${waitingOnNigel.id}, open, waiting on you — in Finance, room ${waitingOnNigel.roomId}:\n  Do we take the Leeds job?`);
		expect(answer).toContain(`  From message ${waitingOnNigel.messageId}, which said:\n    Leeds want us in March.\n  Raised by James's Claude on`);
		expect(answer).toContain(`- Decision ${waitingOnJames.id}, open, waiting on James`);
		expect(answer).toContain('which carries files and no words.');
		expect(answer).toContain(`- Decision ${closedByNigel.id}, closed, it waited on Nigel`);
		expect(answer).toMatch(/Closed by Nigel on .*, with the outcome:\n {4}Yes, with the same broker\./);
	});

	it('refuses a listing that does not fit, and a room of another organisation, pointing at the rooms', async () => {
		expect(await run('list_chat_decisions', { status: 'waiting' })).toBe(chatDecisionListingRefusals.status);
		expect(await run('list_chat_decisions', { limit: chatDecisionLimits.latestDecisionsShown + 1 })).toBe(chatDecisionListingRefusals.limit);
		expect(await run('list_chat_decisions', { roomId: waitingOnNigel.roomId })).toContain('Call list_chat_rooms');
	});

	it('raises the decision as the caller through their Claude, with the page’s own service', async () => {
		raising.mockResolvedValueOnce(waitingOnNigel);
		expect(await run('raise_chat_decision', raisingInput)).toContain(`Decision ${waitingOnNigel.id} is raised in room ${waitingOnNigel.roomId} of Jewel's chat`);
		expect(raising).toHaveBeenCalledWith(nigel.supabase, { ...nigelOnJewel, postedVia: 'claude' }, waitingOnNigel.roomId, expect.objectContaining(raisingInput));
	});

	it('refuses by the field what does not fit the decision’s columns, before anything is read', async () => {
		const wording = 'a'.repeat(chatDecisionLimits.longestWording + 1);
		expect(await run('raise_chat_decision', { ...raisingInput, wording })).toBe(`wording: ${chatDecisionRefusals.wording}`);
		expect(await run('raise_chat_decision', { ...raisingInput, waitingOn: ' ' })).toBe(`waitingOn: ${chatDecisionRefusals.waitingOn}`);
		expect(await run('raise_chat_decision', { ...raisingInput, messageId: 'the last one' })).toMatch(/^messageId: The message must be an id/);
		expect(await run('close_chat_decision', { decisionId: closedByNigel.id, outcome: ' ' })).toBe(`outcome: ${chatDecisionRefusals.outcome}`);
	});

	it('closes the decision with its outcome as the caller, and points a decision it cannot find at the list', async () => {
		closing.mockResolvedValueOnce(closedByNigel);
		const closed = await run('close_chat_decision', { decisionId: closedByNigel.id, outcome: 'Yes, with the same broker.' });
		expect(closed).toContain('is closed, with the outcome:\n  Yes, with the same broker.');
		expect(closing).toHaveBeenCalledWith(nigel.supabase, nigelOnJewel, expect.objectContaining({ decisionId: closedByNigel.id }));
		closing.mockResolvedValueOnce(chatDecisionRefusals.noSuchDecision).mockResolvedValueOnce(chatDecisionRefusals.alreadyClosed);
		const closingAgain = { decisionId: closedByNigel.id, outcome: 'Yes.' };
		expect(await run('close_chat_decision', closingAgain)).toBe(`decisionId: ${chatDecisionRefusals.noSuchDecision} Call list_chat_decisions for the decisions of this organisation and their ids.`);
		expect(await run('close_chat_decision', closingAgain)).toBe(chatDecisionRefusals.alreadyClosed);
	});

	it('does nothing while Chat is not switched on for the organisation', async () => {
		chat.switchedOn = ['news'];
		const input = { ...raisingInput, decisionId: closedByNigel.id, outcome: 'Yes.' };
		for (const action of chatDecisionActions) expect(await run(action.name, input)).toBe(moduleNotSwitchedOn('chat'));
		expect(raising).not.toHaveBeenCalled();
		expect(closing).not.toHaveBeenCalled();
	});
});
