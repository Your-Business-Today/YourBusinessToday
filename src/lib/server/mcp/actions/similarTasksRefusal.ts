import { findSimilarTasks } from '$lib/server/projects/findSimilarTasks';
import { newTaskText } from '$lib/server/projects/similarTasksForNewTask';
import { raiseAnywayRefusal, similarTasksAnswer } from './similarTaskCheck';
import type { McpCaller } from '$lib/server/mcp/resolveMcpCaller';
import type { NewTaskSeed } from '$lib/server/projects/createTask';
import type { Project } from '$lib/server/projects/projectRecord';

/** Why a top level task is not raised yet: open tasks on the project look like it and the caller has not chosen to raise it anyway. */
export async function similarTasksRefusal(
	caller: McpCaller,
	project: Project,
	seed: NewTaskSeed,
	raiseAnyway: unknown
): Promise<string | null> {
	const isAnswered = raiseAnyway === undefined || typeof raiseAnyway === 'boolean';
	if (!isAnswered) return raiseAnywayRefusal;
	const isSubtask = seed.parentTaskId !== null;
	if (raiseAnyway === true || isSubtask) return null;
	const similar = await findSimilarTasks(caller.supabase, project.id, newTaskText(seed.title, seed.story));
	if (similar.length === 0) return null;
	return similarTasksAnswer(seed.title, project.name, similar);
}
