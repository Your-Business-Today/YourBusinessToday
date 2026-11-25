import type { NewTaskSeed } from '$lib/server/projects/createTask';
import type { RaisedTaskFamily } from '$lib/server/projects/createTaskWithSubtasks';

const underNoGoal =
	' It sits under no goal yet: call find_goals and put it under the goal it serves with update_task_details, ' +
	'renaming that goal with update_goal when the work shows the goal is really something broader, or ' +
	'raise the goal it shows with create_goal_with_tasks.';

/** Where a newly raised task landed: its chunks, and a reminder when a top level task has no goal. */
export function placementSentence(seed: NewTaskSeed, family: RaisedTaskFamily): string {
	const { subtaskIds } = family;
	const chunkCount = subtaskIds.length;
	const chunks = chunkCount === 0 ? '' : ` With ${chunkCount} subtasks, each a chunk of the same story.`;
	const isTopLevel = seed.parentTaskId === null;
	const goal = isTopLevel && seed.goalId === null ? underNoGoal : '';
	return `${chunks}${goal}`;
}
