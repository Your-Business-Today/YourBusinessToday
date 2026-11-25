import { describe, expect, it } from 'vitest';
import { requestedGoalsOf } from './requestedGoals';
import { designReviewStates, type DesignReview } from './designReview';

const awaiting: DesignReview = { state: designReviewStates.awaiting, change: 'New platform', reason: '', reviewedBy: null, reviewedAt: null };
const passwords = { id: 'passwords', title: 'Replace 1Password' };
const homepage = { id: 'homepage', title: 'Explain the company' };
const vault = { id: 'vault', goalId: 'passwords', parentTaskId: null, designReview: awaiting };
const vaultChunk = { id: 'vault-chunk', goalId: 'passwords', parentTaskId: 'vault' };
const chunkStep = { id: 'chunk-step', goalId: 'passwords', parentTaskId: 'vault-chunk' };
const plainInGoal = { id: 'plain-in-goal', goalId: 'passwords', parentTaskId: null };
const loose = { id: 'loose', goalId: null, parentTaskId: null, designReview: awaiting };
const elsewhere = { id: 'elsewhere', goalId: 'homepage', parentTaskId: null };
const tasks = [vault, vaultChunk, chunkStep, plainInGoal, loose, elsewhere];

describe('the Requested tab', () => {
	it('moves a goal holding a request across whole, every task with the chunks beneath it', () => {
		const [plan, loosePlan] = requestedGoalsOf(tasks, [passwords, homepage]);
		expect(plan.goalId).toBe('passwords');
		expect(plan.tasks.map(({ task }) => task.id)).toEqual(['vault', 'plain-in-goal']);
		const [vaultWithChunks] = plan.tasks;
		expect(vaultWithChunks.chunks.map((chunk) => chunk.id)).toEqual(['vault-chunk', 'chunk-step']);
		expect(loosePlan.goalId).toBeNull();
		expect(loosePlan.tasks.map(({ task }) => task.id)).toEqual(['loose']);
	});

	it('leaves a goal with no request on the board', () => {
		const goalIds = requestedGoalsOf(tasks, [passwords, homepage]).map(({ goalId }) => goalId);
		expect(goalIds).not.toContain('homepage');
	});
});
