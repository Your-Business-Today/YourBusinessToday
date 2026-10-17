import { findSimilarTasks, type SimilarTask } from '$lib/server/projects/findSimilarTasks';
import { reachableProjectIds } from '../projectAccess';
import type { McpCaller } from '$lib/server/mcp/resolveMcpCaller';
import type { UserStory } from '$lib/data/userStoryRule';

export const raiseAnywayField = {
	type: 'boolean',
	description:
		'true to raise it even though similar open tasks exist — only after showing them to the person and their choosing to'
};

export const raiseAnywayRefusal = 'raiseAnyway is true or false.';

/** The words a new task is compared by: its title and what its story wants. */
export function newTaskText(title: string, story: UserStory | undefined): string {
	return `${title} ${story?.want ?? ''}`;
}

export async function similarTasksFor(caller: McpCaller, text: string): Promise<SimilarTask[]> {
	return findSimilarTasks(caller.supabase, reachableProjectIds(caller), text);
}

export function similarTaskLine(task: SimilarTask): string {
	const shared = task.sharedWords.join(', ');
	return `- "${task.title}" on ${task.projectName}, raised by ${task.raisedBy} (task id: ${task.taskId}; shares: ${shared})`;
}

/** The answer when a new task looks like open ones: each with who raised it, and how to go on. */
export function similarTasksAnswer(title: string, similar: SimilarTask[]): string {
	return [
		`Not raised yet: "${title}" looks like ${similar.length} open task(s) across YBT.`,
		...similar.map(similarTaskLine),
		'Show these to the person. If one already covers it, post on that task instead. If they still want ' +
			'theirs, call create_task again with raiseAnyway: true.'
	].join('\n');
}
