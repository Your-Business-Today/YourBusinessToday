import { parseGoalHorizon } from '$lib/data/goalHorizon';
import { parseGoalStatus, type GoalStatus } from '$lib/data/goalStatus';
import { parseStoryPoints } from '$lib/data/storyPoints';
import { parseTaskStatus, type TaskStatus } from '$lib/data/taskStatus';
import { readStoredDepartment, type Department } from '$lib/data/department';
import type { AgendaGoal } from './agendaItem';
import type { SupabaseClient } from '@supabase/supabase-js';

/** A task as the agent weighs it: where it sits, how big it is, and whether it can be built now. */
export type BoardTask = {
	id: string;
	projectId: string;
	title: string;
	goalId: string | null;
	parentTaskId: string | null;
	waitsForTaskId: string | null;
	status: TaskStatus;
	department: Department;
	priority: number;
	storyPoints: number;
	isBuildable: boolean;
	createdAt: string;
};

/** A goal as the agent weighs it: its horizon and whether it is still open. */
export type BoardGoal = AgendaGoal & { projectId: string; status: GoalStatus };

/** The active projects' names, goals and tasks, read once per turn. */
export type AgendaBoard = {
	projectNamesById: Map<string, string>;
	goalsById: Map<string, BoardGoal>;
	tasksById: Map<string, BoardTask>;
};

const boardColumns =
	'id, name, tasks(id, title, goal_id, parent_task_id, waits_for_task_id, status, department, priority, story_points, is_buildable, created_at), goals(id, title, horizon, status)';

export async function loadAgendaBoard(supabase: SupabaseClient, projectIds: string[]): Promise<AgendaBoard> {
	if (projectIds.length === 0) return { projectNamesById: new Map(), goalsById: new Map(), tasksById: new Map() };
	const { data, error } = await supabase.from('projects').select(boardColumns).in('id', projectIds);
	if (error) throw error;
	const rows = (data ?? []) as Record<string, unknown>[];
	const tasks = rows.flatMap((row) => (row.tasks as Record<string, unknown>[]).map((task) => readTask(task, row.id as string)));
	const goals = rows.flatMap((row) => (row.goals as Record<string, unknown>[]).map((goal) => readGoal(goal, row.id as string)));
	return {
		projectNamesById: new Map(rows.map((row) => [row.id as string, row.name as string])),
		goalsById: new Map(goals.map((goal) => [goal.id, goal])),
		tasksById: new Map(tasks.map((task) => [task.id, task]))
	};
}

function readGoal(row: Record<string, unknown>, projectId: string): BoardGoal {
	const horizon = parseGoalHorizon(row.horizon);
	return { id: row.id as string, title: row.title as string, horizon, projectId, status: parseGoalStatus(row.status) };
}

function readTask(row: Record<string, unknown>, projectId: string): BoardTask {
	return {
		id: row.id as string,
		projectId,
		title: row.title as string,
		goalId: (row.goal_id as string | null) ?? null,
		parentTaskId: (row.parent_task_id as string | null) ?? null,
		waitsForTaskId: (row.waits_for_task_id as string | null) ?? null,
		status: parseTaskStatus(row.status),
		department: readStoredDepartment(row.department),
		priority: (row.priority as number | null) ?? 0,
		storyPoints: parseStoryPoints(row.story_points),
		isBuildable: row.is_buildable === true,
		createdAt: row.created_at as string
	};
}
