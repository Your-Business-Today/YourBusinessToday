import { beforeEach, describe, expect, it, vi } from 'vitest';
import { taskPutBackActions } from './taskPutBackActions';
import { noSuchTaskDeletion } from './taskDeletionActions';
import * as theWorld from './taskDeletionWorld.fixture';
import type { McpCaller } from '../resolveMcpCaller';

const putBack = vi.hoisted(() => ({
	outcome: {} as { taskId: string | null; refusal: string | null },
	calls: [] as unknown[]
}));

vi.mock('$lib/server/projects/getProject', async () => (await import('./taskDeletionWorld.fixture')).projectsDouble);
vi.mock(
	'$lib/server/projects/taskDeletionReading',
	async () => (await import('./taskDeletionWorld.fixture')).readingDouble
);
vi.mock(
	'$lib/server/projects/taskDeletionSurroundings',
	async () => (await import('./taskDeletionWorld.fixture')).surroundingsDouble
);
vi.mock('$lib/server/projects/putBackDeletedTask', () => ({
	putBackDeletedTask: async (...given: unknown[]) => {
		putBack.calls.push(given.slice(1));
		return putBack.outcome;
	}
}));
vi.mock('$lib/server/projects/getTask', () => ({
	getTask: async (_supabase: unknown, id: string) =>
		id === 'story-880'
			? { id, title: 'Fish are drawn from the stock', parentTaskId: null }
			: { id, parentTaskId: 'story-880' }
}));

const { catchSizes, nigelsGone } = theWorld;
const caller = theWorld.caller as unknown as McpCaller;
const [putBackAction] = taskPutBackActions;

describe('put_back_deleted_task', () => {
	beforeEach(() => {
		theWorld.standTheWorld();
		putBack.calls = [];
		putBack.outcome = { taskId: catchSizes.taskId, refusal: null };
	});

	it('puts a deletion back as the caller, and says where it went, what came with it and what did not', async () => {
		const answer = await putBackAction.run(caller, { deletionId: catchSizes.id });
		expect(putBack.calls).toEqual([[catchSizes.id, caller.accountId]]);
		const back = `"Catch sizes follow the stock" is back on the board under "Fish are drawn from the stock"`;
		expect(answer).toContain(`${back}, as task ${catchSizes.taskId}, the id it had.`);
		expect(answer).toContain('Back with it: 2 messages in its conversation and one lifecycle step.');
		expect(answer).toContain(
			'Its attached files ("catch-chart.png") are named on the record, but the files themselves'
		);
	});

	it('passes on why the database refused, in its own words', async () => {
		const refusal = 'Task "Catch sizes follow the stock" was put back already.';
		putBack.outcome = { taskId: null, refusal };
		expect(await putBackAction.run(caller, { deletionId: catchSizes.id })).toBe(refusal);
	});

	it('puts back nothing the caller may not read', async () => {
		expect(await putBackAction.run(caller, { deletionId: nigelsGone.id })).toBe(noSuchTaskDeletion);
		expect(putBack.calls).toEqual([]);
	});
});
