import { beforeEach, describe, expect, it, vi } from 'vitest';
import { noSuchOrganisation } from '../organisationAccess';
import { taskStatusLabels } from '$lib/data/taskStatus';
import { teamWorkActions } from './teamWorkActions';
import type { McpCaller } from '../resolveMcpCaller';

const jewelId = '11111111-1111-4111-8111-111111111111';
const unknownId = '22222222-2222-4222-8222-222222222222';
const portalId = '33333333-3333-4333-8333-333333333333';
const contractTaskId = '44444444-4444-4444-8444-444444444444';
const trademarkTaskId = '55555555-5555-4555-8555-555555555555';
const jamesId = '66666666-6666-4666-8666-666666666666';
const staff = { accountId: jamesId, isStaff: true, organisationMemberships: [], supabase: {} } as unknown as McpCaller;

const { board } = vi.hoisted(() => ({ board: { tasks: [] as unknown[] } }));

vi.mock('$lib/server/organisations/getOrganisation', () => ({
	getOrganisation: async (_supabase: unknown, id: string) => (id === jewelId ? { id: jewelId, name: 'Jewel' } : null)
}));
vi.mock('$lib/server/organisations/getReachableProjectsOf', () => ({ getReachableProjectsOf: async () => [{ id: portalId, name: 'Portal' }] }));
vi.mock('$lib/server/organisations/getOpenTeamWork', () => ({ getOpenTeamWork: async () => board.tasks }));
vi.mock('$lib/server/projects/getAssigneeIdsByTask', () => ({ getAssigneeIdsByTask: async () => new Map([[contractTaskId, [jamesId]]]) }));
vi.mock('$lib/server/members/getPeopleOnProject', () => ({ getPeopleOnProject: async () => [{ id: jamesId, name: 'James', email: '' }] }));

const sendTheContract = { id: contractTaskId, projectId: portalId, department: 'sales', title: 'Send the contract', status: 'in_progress', dueDate: '2026-11-20' };
const registerTheMark = { id: trademarkTaskId, projectId: portalId, department: 'administration', title: 'Register the trade mark', status: 'backlog', dueDate: null };

function run(input: Record<string, unknown>) {
	const [readTeamWork] = teamWorkActions;
	return readTeamWork.run(staff, input);
}

describe("an organisation's team work through the connector", () => {
	beforeEach(() => {
		board.tasks = [sendTheContract, registerTheMark];
	});

	it('lists the open jobs department by department with their owners, as the Tasks page does', async () => {
		expect(await run({ organisationId: jewelId })).toBe(
			[
				`Administration (1):\nRegister the trade mark — Portal — ${taskStatusLabels.backlog} — no owner — no due date — task ${trademarkTaskId}`,
				`Sales (1):\nSend the contract — Portal — ${taskStatusLabels.in_progress} — owned by James — due 20 Nov 2026 — task ${contractTaskId}`
			].join('\n\n')
		);
	});

	it('filters as the page does: the caller’s own jobs, the ones nobody has, a status', async () => {
		expect(await run({ organisationId: jewelId, assignedTo: 'me' })).toContain('Send the contract');
		expect(await run({ organisationId: jewelId, assignedTo: 'me' })).not.toContain('Register the trade mark');
		expect(await run({ organisationId: jewelId, assignedTo: 'nobody' })).not.toContain('Send the contract');
		expect(await run({ organisationId: jewelId, status: 'backlog', productId: portalId })).toContain('Register the trade mark');
	});

	it('refuses a filter it cannot read rather than ignoring it', async () => {
		expect(await run({ organisationId: jewelId, assignedTo: 'Jeremy' })).toContain('assignedTo is');
		expect(await run({ organisationId: jewelId, status: 'done' })).toContain('only open jobs');
		expect(await run({ organisationId: jewelId, productId: 'portal' })).toContain('productId is a project id');
	});

	it('says when the team has nothing open that matches', async () => {
		board.tasks = [];
		expect(await run({ organisationId: jewelId })).toBe("The team has no open jobs across Jewel's products that match.");
	});

	it('refuses an organisation the caller cannot reach, or an id that is not one', async () => {
		expect(await run({ organisationId: unknownId })).toBe(noSuchOrganisation);
		expect(await run({ organisationId: 'jewel' })).toContain('The organisationId must be an id');
	});
});
