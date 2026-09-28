import type { SupabaseClient } from '@supabase/supabase-js';
import { parseStoryPoints } from '$lib/data/storyPoints';
import { doneTaskStatus, parseTaskStatus } from '$lib/data/taskStatus';
import { weightedCompletionPercent, type CompletionInput } from '$lib/data/completionSummary';
import { parseProjectRecord, type Project } from '$lib/server/projects/projectRecord';
import type { AssignedTaskCounts } from '$lib/server/projects/getAssignedTaskCounts';

export type TaskTally = {
	openTaskCount: number;
	taskCount: number;
	completionPercent: number;
};

export type ProjectProgress = TaskTally & { assignedTaskCount: number };

export type ProjectSummary = Project & ProjectProgress;

type TaskProgress = CompletionInput & { isDone: boolean };

export async function getProjectList(
	supabase: SupabaseClient,
	ownerId: string,
	assignedTaskCounts: AssignedTaskCounts
): Promise<ProjectSummary[]> {
	const { data, error } = await supabase
		.from('projects')
		.select('*, tasks(status, story_points, completion_percent)')
		.eq('owner_id', ownerId)
		.order('priority', { ascending: true });
	if (error) throw error;
	return data.map((row: Record<string, unknown>) => {
		const project = parseProjectRecord(row);
		const taskRows = row.tasks as Record<string, unknown>[];
		return {
			...project,
			...tallyTasks(taskRows),
			assignedTaskCount: assignedTaskCounts.forProject(project.id)
		};
	});
}

function tallyTasks(taskRows: Record<string, unknown>[]): TaskTally {
	const tasks = taskRows.map(readTaskProgress);
	return {
		openTaskCount: tasks.filter((task) => !task.isDone).length,
		taskCount: tasks.length,
		completionPercent: weightedCompletionPercent(tasks)
	};
}

function readTaskProgress(row: Record<string, unknown>): TaskProgress {
	return {
		isDone: parseTaskStatus(row.status) === doneTaskStatus,
		storyPoints: parseStoryPoints(row.story_points),
		completionPercent: Number(row.completion_percent ?? 0)
	};
}
