import type { SupabaseClient } from '@supabase/supabase-js';
import { parseStoryPoints } from '$lib/data/storyPoints';
import { doneTaskStatus, parseTaskStatus } from '$lib/data/taskStatus';
import { currentWork, type HorizonedGoal, type PlacedTask } from '$lib/data/taskHorizons';
import { goalsOnHorizon, longTermGoalHorizon, parseGoalHorizon } from '$lib/data/goalHorizon';
import { weightedCompletionPercent, type CompletionInput } from '$lib/data/completionSummary';
import type { ProjectTally, TaskTally } from './ownedProjectTallies';

type TaskProgress = PlacedTask & CompletionInput & { isDone: boolean };

/** The projects list's figures worked out here from every task and goal, until migration 0139 counts them. */
export async function tallyOwnedProjectsInSite(
	supabase: SupabaseClient,
	ownerId: string
): Promise<Map<string, ProjectTally>> {
	const { data, error } = await supabase
		.from('projects')
		.select('id, tasks(id, parent_task_id, goal_id, status, story_points, completion_percent), goals(id, horizon)')
		.eq('owner_id', ownerId);
	if (error) throw error;
	return new Map(data.map((row: Record<string, unknown>) => [row.id as string, tallyProject(row)]));
}

function tallyProject(row: Record<string, unknown>): ProjectTally {
	const tasks = (row.tasks as Record<string, unknown>[]).map(readTaskProgress);
	const goals = (row.goals as Record<string, unknown>[]).map(readGoalHorizon);
	return {
		...tallyTasks(currentWork(tasks, goals)),
		longTermGoalCount: goalsOnHorizon(goals, longTermGoalHorizon).length
	};
}

function tallyTasks(tasks: TaskProgress[]): TaskTally {
	return {
		openTaskCount: tasks.filter((task) => !task.isDone).length,
		taskCount: tasks.length,
		completionPercent: weightedCompletionPercent(tasks)
	};
}

function readTaskProgress(row: Record<string, unknown>): TaskProgress {
	return {
		id: row.id as string,
		parentTaskId: (row.parent_task_id as string) ?? null,
		goalId: (row.goal_id as string) ?? null,
		isDone: parseTaskStatus(row.status) === doneTaskStatus,
		storyPoints: parseStoryPoints(row.story_points),
		completionPercent: Number(row.completion_percent ?? 0)
	};
}

function readGoalHorizon(row: Record<string, unknown>): HorizonedGoal {
	return { id: row.id as string, horizon: parseGoalHorizon(row.horizon) };
}
