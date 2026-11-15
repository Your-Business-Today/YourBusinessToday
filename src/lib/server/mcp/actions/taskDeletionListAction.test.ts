import { beforeEach, describe, expect, it, vi } from 'vitest';
import { noSuchProjectWithDeletions, taskDeletionActions } from './taskDeletionActions';
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
const [listAction] = taskDeletionActions;
const { goneProject, otherProject, catchSizes, world } = theWorld;

describe('list_task_deletions', () => {
	beforeEach(theWorld.standTheWorld);

	it('lists a project’s deleted tasks with where each stood, what it was under, who deleted it and when', async () => {
		const answer = await listAction.run(caller, { projectId: carpMania });
		expect(answer).toContain('Deleted from "Carp Mania", newest first. 1 shown; read_task_deletion reads one in full.');
		const line = `"Catch sizes follow the stock", Done, under "Fish are drawn from the stock"; deleted by James. Id ${catchSizes.id}`;
		expect(answer).toContain(`- 14 Nov 2026 at 21:34: ${line}`);
	});

	it('does not list a project the caller is not on that still stands', async () => {
		world.standingProjectIds.add(otherProject);
		expect(await listAction.run(caller, { projectId: otherProject })).toBe(noSuchProjectWithDeletions);
	});

	it('lists what the caller deleted with a project deleted whole, and nobody else’s', async () => {
		const answer = await listAction.run(caller, {});
		expect(answer).toContain('Deleted by you, with projects that have since been deleted whole');
		expect(answer).toContain('"Landing page", Backlog; deleted by James.');
		expect(answer).not.toContain('Nigel’s task');
		expect(await listAction.run(caller, { projectId: goneProject })).toContain('"Landing page"');
		expect(await listAction.run(caller, { projectId: otherProject })).toBe(noSuchProjectWithDeletions);
	});
});
