import { newTaskText, raiseAnywayRefusal, similarTasksAnswer, similarTasksFor } from './similarTaskCheck';
import type { McpCaller } from '$lib/server/mcp/resolveMcpCaller';
import type { NewTaskSeed } from '$lib/server/projects/createTask';

/** Why a top level task is not raised yet: open tasks across YBT look like it and the caller has not chosen to raise it anyway. */
export async function similarTasksRefusal(
	caller: McpCaller,
	seed: NewTaskSeed,
	raiseAnyway: unknown
): Promise<string | null> {
	const isAnswered = raiseAnyway === undefined || typeof raiseAnyway === 'boolean';
	if (!isAnswered) return raiseAnywayRefusal;
	const isSubtask = seed.parentTaskId !== null;
	if (raiseAnyway === true || isSubtask) return null;
	const similar = await similarTasksFor(caller, newTaskText(seed.title, seed.story));
	if (similar.length === 0) return null;
	return similarTasksAnswer(seed.title, similar);
}
