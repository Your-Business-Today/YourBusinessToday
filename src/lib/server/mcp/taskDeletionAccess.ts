import { isUuid } from '$lib/data/isUuid';
import { findTaskDeletion, findTaskDeletions, findTaskDeletionsBy } from '$lib/server/projects/taskDeletionReading';
import { findStandingProjectIds } from '$lib/server/projects/taskDeletionSurroundings';
import { canReachProject, reachableProject } from './projectAccess';
import type { McpCaller } from './resolveMcpCaller';
import type { TaskDeletion } from '$lib/server/projects/taskDeletionReading';

/** The deletions a caller may read from one place, and how that place is named in a sentence. */
export type ReadableDeletions = {
	whereFrom: string;
	deletions: TaskDeletion[];
};

const fromProjectsSinceDeleted = 'by you, with projects that have since been deleted whole';
const fromOneProjectSinceDeleted = 'by you, from a project that has since been deleted whole';

/**
 * The record keeps a task whatever became of its project, but row level security lets nobody read it, so the
 * connector reads it with the service role and asks first: a project the caller is on, or, once a project has
 * been deleted whole and nobody can be on it, the tasks the caller deleted from it.
 */
export async function readableDeletionsOfProject(
	caller: McpCaller,
	projectId: string
): Promise<ReadableDeletions | null> {
	const project = await reachableProject(caller, projectId);
	if (project !== null)
		return {
			whereFrom: `from "${project.name}"`,
			deletions: await findTaskDeletions(caller.supabase, project.id)
		};
	if (!isUuid(projectId)) return null;
	const ownDeletions = await deletionsFromProjectsSinceDeleted(caller);
	const fromThatProject = ownDeletions.filter((deletion) => deletion.projectId === projectId);
	if (fromThatProject.length === 0) return null;
	return { whereFrom: fromOneProjectSinceDeleted, deletions: fromThatProject };
}

/** The tasks the caller deleted with a project deleted whole, which no project's list can show. */
export async function readableDeletionsOfDeletedProjects(caller: McpCaller): Promise<ReadableDeletions> {
	return {
		whereFrom: fromProjectsSinceDeleted,
		deletions: await deletionsFromProjectsSinceDeleted(caller)
	};
}

/** The deletion with that id, when the caller may read it, or null when there is none they may. */
export async function readableDeletion(caller: McpCaller, deletionId: string): Promise<TaskDeletion | null> {
	if (!isUuid(deletionId)) return null;
	const deletion = await findTaskDeletion(caller.supabase, deletionId);
	if (deletion === null) return null;
	if (canReachProject(caller, deletion.projectId)) return deletion;
	if (deletion.deletedByAccountId !== caller.accountId) return null;
	const standingIds = await findStandingProjectIds(caller.supabase, [deletion.projectId]);
	if (standingIds.has(deletion.projectId)) return null;
	return deletion;
}

async function deletionsFromProjectsSinceDeleted(caller: McpCaller): Promise<TaskDeletion[]> {
	const ownDeletions = await findTaskDeletionsBy(caller.supabase, caller.accountId);
	const standingIds = await findStandingProjectIds(
		caller.supabase,
		ownDeletions.map((deletion) => deletion.projectId)
	);
	return ownDeletions.filter((deletion) => !standingIds.has(deletion.projectId));
}
