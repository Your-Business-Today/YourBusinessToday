import { buildTaskTree } from '$lib/server/projects/buildTaskTree';
import { currentWork } from '$lib/data/taskHorizons';
import { isCurrentGoal } from '$lib/data/goalHorizon';
import { isTaskDone } from '$lib/data/taskStatus';
import { openGoalStatus } from '$lib/data/goalStatus';
import { parseGoalRecord, type Goal } from '$lib/server/goals/goalRecord';
import { parseProjectStatus } from '$lib/data/projectStatus';
import { parseTaskRecord, type ProjectTask } from '$lib/server/projects/taskRecord';
import { portalTaskStatusLabel } from '$lib/portal/portalTaskStatus';
import { settledGoalIds } from '$lib/data/settledGoalIds';
import { summariseGoals, type GoalSummary } from '$lib/server/goals/summariseGoals';
import { weightedCompletionPercent } from '$lib/data/completionSummary';
import type { PortalGoal, PortalProject, PortalTask } from '$lib/portal/portalProject';

const noGoalTitle = '';

export const portalProjectColumns =
	'id, name, status, client_id, environment_url, goals(*), tasks(*)';

/** Only what a client reads leaves here: no repository, database, branch, estimate or staff notes. */
export function toPortalProject(row: Record<string, unknown>): PortalProject {
	const goals = readRows(row.goals).map(parseGoalRecord);
	const currentTasks = currentWork(readRows(row.tasks).map(parseTaskRecord), goals);
	return {
		id: row.id as string,
		name: row.name as string,
		clientId: (row.client_id as string) ?? null,
		status: parseProjectStatus(row.status),
		environmentUrl: (row.environment_url as string) ?? '',
		completionPercent: weightedCompletionPercent(currentTasks),
		currentGoals: summariseGoals(goals, currentTasks).filter(isOpenCurrentGoal).map(toPortalGoal),
		openTasks: openTasksOf(currentTasks, goals)
	};
}

function readRows(value: unknown): Record<string, unknown>[] {
	return (value ?? []) as Record<string, unknown>[];
}

function isOpenCurrentGoal(goal: GoalSummary): boolean {
	return goal.status === openGoalStatus && isCurrentGoal(goal);
}

function toPortalGoal(goal: GoalSummary): PortalGoal {
	return {
		id: goal.id,
		title: goal.title,
		measure: goal.measure,
		completionPercent: goal.completionPercent,
		openTaskCount: goal.taskCount - goal.doneTaskCount
	};
}

function openTasksOf(tasks: ProjectTask[], goals: Goal[]): PortalTask[] {
	const goalTitleById = new Map(goals.map((goal) => [goal.id, goal.title]));
	const goalIdsByTask = settledGoalIds(buildTaskTree(tasks), new Set(goalTitleById.keys()));
	const goalTitleOf = (task: ProjectTask) => {
		const goalId = goalIdsByTask.get(task.id) ?? null;
		if (goalId === null) return noGoalTitle;
		return goalTitleById.get(goalId) ?? noGoalTitle;
	};
	const openTasks = tasks.filter((task) => !isTaskDone(task.status));
	return openTasks.map((task) => toPortalTask(task, goalTitleOf(task)));
}

function toPortalTask(task: ProjectTask, goalTitle: string): PortalTask {
	return {
		id: task.id,
		title: task.title,
		statusLabel: portalTaskStatusLabel(task.kind, task.status),
		goalTitle
	};
}
