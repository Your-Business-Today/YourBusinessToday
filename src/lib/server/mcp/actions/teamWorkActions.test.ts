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
const staff = { accountId: 'staff-1', isStaff: true, organisationMemberships: [], supabase: {} } as unknown as McpCaller;

const { board } = vi.hoisted(() => ({ board: { tasks: [] as unknown[] } }));

vi.mock('$lib/server/organisations/getOrganisation', () => ({
	getOrganisation: async (_supabase: unknown, id: string) => (id === jewelId ? { id: jewelId, name: 'Jewel' } : null)
}));
vi.mock('$lib/server/organisations/getReachableProjectsOf', () => ({ getReachableProjectsOf: async () => [{ id: portalId, name: 'Portal' }] }));
vi.mock('$lib/server/organisations/getOpenTeamWork', () => ({ getOpenTeamWork: async () => board.tasks }));

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

	it('lists the open jobs department by department, as the Tasks page does', async () => {
		expect(await run({ organisationId: jewelId })).toBe(
			[
				`Administration (1):\nRegister the trade mark — Portal — ${taskStatusLabels.backlog} — no due date — task ${trademarkTaskId}`,
				`Sales (1):\nSend the contract — Portal — ${taskStatusLabels.in_progress} — due 20 Nov 2026 — task ${contractTaskId}`
			].join('\n\n')
		);
	});

	it('says when the team has nothing open', async () => {
		board.tasks = [];
		expect(await run({ organisationId: jewelId })).toBe("The team has no open jobs across Jewel's products.");
	});

	it('refuses an organisation the caller cannot reach, or an id that is not one', async () => {
		expect(await run({ organisationId: unknownId })).toBe(noSuchOrganisation);
		expect(await run({ organisationId: 'jewel' })).toContain('The organisationId must be an id');
	});
});
