import { parseTaskStatus } from '$lib/data/taskStatus';
import type { TaskDeletion } from '$lib/server/projects/taskDeletionReading';

type Row = Record<string, unknown>;

export const carpMania = '7aaf0fd2-7cb6-4e91-a998-6d3309ded6ee';
export const goneProject = '0d1e7e7e-0000-4000-8000-000000000001';
export const otherProject = '0d1e7e7e-0000-4000-8000-000000000002';
const james = 'a0000000-0000-4000-8000-000000000001';
const nigel = 'a0000000-0000-4000-8000-000000000002';

/** What the database holds in these tests: the record of deletions, the projects and the tasks still standing. */
export const world = {
	deletions: [] as TaskDeletion[],
	standingProjectIds: new Set<string>(),
	standingTaskTitles: new Map<string, string>()
};

function deletion(id: string, projectId: string, title: string, record: Row, deletedBy = james): TaskDeletion {
	const parentTaskId = typeof record.parent_task_id === 'string' ? record.parent_task_id : null;
	const status = parseTaskStatus(record.status);
	const deletedAt = '2026-11-14T21:34:00Z';
	return {
		id,
		taskId: `task-${id}`,
		projectId,
		title,
		status,
		parentTaskId,
		record,
		deletedByAccountId: deletedBy,
		deletedAt,
		putBackAt: null
	};
}

export const catchSizes = deletion('d0000000-0000-4000-8000-000000000001', carpMania, 'Catch sizes follow the stock', {
	status: 'done',
	parent_task_id: 'story-880',
	conversation_messages: [{ body: 'Merged' }, { body: 'Live' }],
	lifecycle_steps: [{ step: 'merged' }],
	task_attachments: [{ filename: 'catch-chart.png' }]
});
export const goneWithProject = deletion('d0000000-0000-4000-8000-000000000002', goneProject, 'Landing page', {});
export const nigelsGone = deletion('d0000000-0000-4000-8000-000000000003', otherProject, 'Nigel’s task', {}, nigel);

export const caller = {
	accountId: james,
	ownedProjectIds: [carpMania],
	memberProjectIds: [],
	supabase: {}
};

/** The world as each test starts it: one deletion from Carp Mania, one with a project James deleted, one of Nigel's. */
export function standTheWorld(): void {
	world.deletions = [catchSizes, goneWithProject, nigelsGone];
	world.standingProjectIds = new Set([carpMania]);
	world.standingTaskTitles = new Map([['story-880', 'Fish are drawn from the stock']]);
}

export const projectsDouble = {
	getProject: async (_supabase: unknown, id: string) =>
		world.standingProjectIds.has(id) ? { id, name: 'Carp Mania' } : null
};

export const accountsDouble = {
	getAccountsById: async (_supabase: unknown, ids: string[]) =>
		ids.map((id) => ({ id, name: id === james ? 'James' : 'Nigel' }))
};

export const readingDouble = {
	findTaskDeletions: async (_supabase: unknown, projectId: string) =>
		world.deletions.filter((kept) => kept.projectId === projectId),
	findTaskDeletionsBy: async (_supabase: unknown, accountId: string) =>
		world.deletions.filter((kept) => kept.deletedByAccountId === accountId),
	findTaskDeletion: async (_supabase: unknown, id: string) => world.deletions.find((kept) => kept.id === id) ?? null
};

export const surroundingsDouble = {
	findStandingProjectIds: async (_supabase: unknown, ids: string[]) =>
		new Set(ids.filter((id) => world.standingProjectIds.has(id))),
	findParentTitles: async (_supabase: unknown, deletions: TaskDeletion[]) =>
		new Map([...world.standingTaskTitles, ...deletions.map((kept): [string, string] => [kept.taskId, kept.title])])
};
