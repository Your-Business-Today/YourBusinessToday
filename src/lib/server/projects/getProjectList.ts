import type { SupabaseClient } from '@supabase/supabase-js';
import { parseStoryPoints } from '$lib/data/storyPoints';
import { doneTaskStatus, parseTaskStatus } from '$lib/data/taskStatus';
import { currentWork, type HorizonedGoal, type PlacedTask } from '$lib/data/taskHorizons';
import { goalsOnHorizon, longTermGoalHorizon, parseGoalHorizon } from '$lib/data/goalHorizon';
import { weightedCompletionPercent, type CompletionInput } from '$lib/data/completionSummary';
import { parseProjectRecord, type Project } from '$lib/server/projects/projectRecord';
import type { AssignedTaskCounts } from '$lib/server/projects/getAssignedTaskCounts';

/** The current work on a project: a task under a long term goal counts toward none of these. */
export type TaskTally = {
	openTaskCount: number;
	taskCount: number;
	completionPercent: number;
};

export type ProjectProgress = TaskTally & { assignedTaskCount: number; longTermGoalCount: number };

export type ProjectSummary = Project & ProjectProgress;

type TaskProgress = PlacedTask & CompletionInput & { isDone: boolean };

export async function getProjectList(
	supabase: SupabaseClient,
	ownerId: string,
	assignedTaskCounts: AssignedTaskCounts
): Promise<ProjectSummary[]> {
	const { data, error } = await supabase
		.from('projects')
		.select(
			'*, tasks(id, parent_task_id, goal_id, status, story_points, completion_percent), goals(id, horizon)'
		)
		.eq('owner_id', ownerId)
		.order('priority', { ascending: true });
	if (error) throw error;
	return data.map((row: Record<string, unknown>) => {
		const project = parseProjectRecord(row);
		const tasks = (row.tasks as Record<string, unknown>[]).map(readTaskProgress);
		const goals = (row.goals as Record<string, unknown>[]).map(readGoalHorizon);
		return {
			...project,
			...tallyTasks(currentWork(tasks, goals)),
			assignedTaskCount: assignedTaskCounts.forProject(project.id),
			longTermGoalCount: goalsOnHorizon(goals, longTermGoalHorizon).length
		};
	});
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
