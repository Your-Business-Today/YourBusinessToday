import { beforeEach, describe, expect, it, vi } from 'vitest';
import { testResultActions } from './testResultActions';
import type { McpCaller } from '../resolveMcpCaller';

const { feature, messagePosted, taskRaised } = vi.hoisted(() => ({
	feature: { id: 'feature-1', projectId: 'project-1', goalId: 'goal-1', title: 'My work screen' },
	messagePosted: vi.fn(),
	taskRaised: vi.fn(async () => 'fix-1')
}));

vi.mock('$lib/server/projects/getTask', () => ({ getTask: async () => feature }));
vi.mock('$lib/server/projects/newTaskRefusal', () => ({ newTaskRefusal: async () => null }));
vi.mock('$lib/server/conversations/postMessage', () => ({ postMessage: messagePosted }));
vi.mock('$lib/server/projects/createTask', () => ({ createTask: taskRaised }));

const tester = {
	accountId: 'james',
	isStaff: true,
	ownedProjectIds: [feature.projectId],
	memberProjectIds: [],
	supabase: {}
} as unknown as McpCaller;

const [recordTestResults] = testResultActions;
const confirmed = { taskId: feature.id, outcome: 'confirmed', proof: 'Saw my to-dos.' };
const failed = { taskId: feature.id, outcome: 'failed', proof: 'Blank page.', fault: 'My work is blank' };

describe('record_test_results', () => {
	beforeEach(() => vi.clearAllMocks());

	it('posts a confirmation on the feature and raises nothing', async () => {
		const answer = await recordTestResults.run(tester, { results: [confirmed] });
		expect(answer).toContain('confirmed');
		expect(messagePosted).toHaveBeenCalledTimes(1);
		expect(taskRaised).not.toHaveBeenCalled();
	});

	it('raises a FIX under the same goal for a failure', async () => {
		const answer = await recordTestResults.run(tester, { results: [confirmed, failed] });
		expect(answer).toContain('FIX: My work is blank');
		const { calls } = taskRaised.mock;
		const [, projectId, seed] = calls[0] as unknown as [unknown, string, { goalId: string }];
		expect(projectId).toBe(feature.projectId);
		expect(seed.goalId).toBe(feature.goalId);
		expect(messagePosted).toHaveBeenCalledTimes(2);
	});

	it('records nothing when one result does not fit', async () => {
		const answer = await recordTestResults.run(tester, { results: [confirmed, { ...failed, fault: '' }] });
		expect(answer).toContain('Result 2');
		expect(messagePosted).not.toHaveBeenCalled();
	});
});
