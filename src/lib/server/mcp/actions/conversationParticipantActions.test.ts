import { beforeEach, describe, expect, it, vi } from 'vitest';
import { conversationParticipantActions } from './conversationParticipantActions';
import { noSuchSubject } from './resolveSubject';
import type { McpCaller } from '../resolveMcpCaller';

const projectId = '11111111-1111-4111-8111-111111111111';
const taskId = '22222222-2222-4222-8222-222222222222';
const goalId = '33333333-3333-4333-8333-333333333333';
const unknownId = '44444444-4444-4444-8444-444444444444';
const jamesId = 'james-1';
const nigelId = 'nigel-1';
const strangerId = 'stranger-1';
const staff = { accountId: jamesId, ownedProjectIds: [projectId], memberProjectIds: [], supabase: {} } as unknown as McpCaller;

const { conversation, added, removed } = vi.hoisted(() => ({ conversation: { ids: [] as string[] }, added: vi.fn(), removed: vi.fn() }));

vi.mock('$lib/server/projects/getTask', () => ({
	getTask: async (_supabase: unknown, id: string) => (id === taskId ? { id: taskId, projectId, title: 'Fix the total', goalId: null } : null)
}));
vi.mock('$lib/server/goals/getGoal', () => ({
	getGoal: async (_supabase: unknown, id: string) => (id === goalId ? { id: goalId, projectId, title: 'Win the first client' } : null)
}));
vi.mock('$lib/server/members/getPeopleOnProject', () => ({
	getPeopleOnProject: async () => [
		{ id: jamesId, name: 'James', email: 'james@example.com' },
		{ id: nigelId, name: 'Nigel', email: 'nigel@example.com' }
	]
}));
vi.mock('$lib/server/conversations/getConversationParticipantIds', () => ({ getConversationParticipantIds: async () => conversation.ids }));
vi.mock('$lib/server/conversations/addConversationParticipant', () => ({ addConversationParticipant: added }));
vi.mock('$lib/server/conversations/removeConversationParticipant', () => ({ removeConversationParticipant: removed }));

function run(name: string, input: Record<string, unknown>) {
	const action = conversationParticipantActions.find((candidate) => candidate.name === name);
	if (action === undefined) throw new Error(`No action named ${name}`);
	return action.run(staff, input);
}

describe('who follows a conversation, through the connector', () => {
	beforeEach(() => {
		vi.clearAllMocks();
		conversation.ids = [jamesId];
		added.mockImplementation(async (_supabase: unknown, _subject: unknown, accountId: string) => conversation.ids.push(accountId));
		removed.mockImplementation(async (_supabase: unknown, _subject: unknown, accountId: string) => {
			conversation.ids = conversation.ids.filter((id) => id !== accountId);
		});
	});

	it("adds someone on the project to a task's conversation and says who is on it", async () => {
		expect(await run('add_conversation_participant', { taskId, accountId: nigelId })).toBe(
			'Nigel is on the conversation of the task “Fix the total”. On it now: James, Nigel.'
		);
		expect(added).toHaveBeenCalledWith(staff.supabase, { taskId }, nigelId);
	});

	it('adds nobody who is not on the project, and needs one goal or task that can be reached', async () => {
		expect(await run('add_conversation_participant', { taskId, accountId: strangerId })).toContain('Nobody on the project has that accountId');
		expect(await run('add_conversation_participant', { goalId: unknownId, accountId: nigelId })).toBe(noSuchSubject);
		expect(await run('add_conversation_participant', { accountId: nigelId })).toBe(noSuchSubject);
		expect(added).not.toHaveBeenCalled();
	});

	it("takes someone off a goal's conversation", async () => {
		conversation.ids = [jamesId, nigelId];
		expect(await run('remove_conversation_participant', { goalId, accountId: nigelId })).toBe(
			'Nigel is off the conversation of the goal “Win the first client”. On it now: James.'
		);
		expect(removed).toHaveBeenCalledWith(staff.supabase, { goalId }, nigelId);
	});

	it('says when they were not on it, and writes nothing', async () => {
		expect(await run('remove_conversation_participant', { goalId, accountId: nigelId })).toContain('Nobody with that accountId is on the conversation');
		expect(removed).not.toHaveBeenCalled();
	});
});
