import { beforeEach, describe, expect, it, vi } from 'vitest';
import { noSuchTaskDeletion, taskDeletionActions } from './taskDeletionActions';
import * as theWorld from './taskDeletionWorld.fixture';
import type { McpCaller } from '../resolveMcpCaller';

vi.mock('$lib/server/projects/getProject', async () => (await import('./taskDeletionWorld.fixture')).projectsDouble);
vi.mock(
	'$lib/server/accounts/getAccountsById',
	async () => (await import('./taskDeletionWorld.fixture')).accountsDouble
);
vi.mock(
	'$lib/server/projects/taskDeletionReading',
	async () => (await import('./taskDeletionWorld.fixture')).readingDouble
);
vi.mock(
	'$lib/server/projects/taskDeletionSurroundings',
	async () => (await import('./taskDeletionWorld.fixture')).surroundingsDouble
);

const { carpMania } = theWorld;
const caller = theWorld.caller as unknown as McpCaller;
const [, readAction] = taskDeletionActions;
const { catchSizes, goneWithProject, nigelsGone } = theWorld;

describe('read_task_deletion', () => {
	beforeEach(theWorld.standTheWorld);

	it('reads one deletion in full, with its history counted, an honest line on its files, and the copy', async () => {
		const answer = await readAction.run(caller, { deletionId: catchSizes.id });
		expect(answer).toContain(`It was task ${catchSizes.taskId} on project ${carpMania}.`);
		expect(answer).toContain('Kept with it: 2 messages in its conversation and one lifecycle step.');
		expect(answer).toContain(
			'Its attached files ("catch-chart.png") are named on the record, but the files themselves'
		);
		expect(answer).toContain('"parent_task_id": "story-880"');
	});

	it('reads a deletion only where the caller may: on their project, or one they deleted with its project', async () => {
		expect(await readAction.run(caller, { deletionId: goneWithProject.id })).toContain('"Landing page"');
		expect(await readAction.run(caller, { deletionId: nigelsGone.id })).toBe(noSuchTaskDeletion);
		expect(await readAction.run(caller, { deletionId: 'not-an-id' })).toBe(noSuchTaskDeletion);
	});
});
