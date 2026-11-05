import { parseGoalHorizon } from '$lib/data/goalHorizon';
import { subjectKinds, type AgendaGoal, type AgendaItem } from './agendaItem';
import type { SupabaseClient } from '@supabase/supabase-js';

type PlacedTask = { goalId: string | null; parentTaskId: string | null };
type ProjectGoals = { goalsById: Map<string, AgendaGoal>; tasksById: Map<string, PlacedTask> };

const projectGoalColumns = 'id, tasks(id, goal_id, parent_task_id), goals(id, title, horizon)';

/**
 * Each item with the goal its work counts toward: the goal it was said on, or its task's own goal, or
 * its parent task's, the same rule the backlog and the horizons follow. Work that counts toward no goal,
 * a to-do on the person's own list or someone to chase, stays without one and so counts as current.
 */
export async function placeOnGoals(supabase: SupabaseClient, items: AgendaItem[]): Promise<AgendaItem[]> {
	const projectIds = [...new Set(items.flatMap((item) => item.projectId ?? []))];
	if (projectIds.length === 0) return items;
	const board = await loadProjectGoals(supabase, projectIds);
	return items.map((item) => ({ ...item, goal: goalOfItem(item, board) }));
}

async function loadProjectGoals(supabase: SupabaseClient, projectIds: string[]): Promise<ProjectGoals> {
	const { data, error } = await supabase.from('projects').select(projectGoalColumns).in('id', projectIds);
	if (error) throw error;
	const rows = (data ?? []) as Record<string, unknown>[];
	const tasks = rows.flatMap((row) => row.tasks as Record<string, unknown>[]);
	const goals = rows.flatMap((row) => row.goals as Record<string, unknown>[]);
	return {
		goalsById: new Map(goals.map((goal) => [goal.id as string, readGoal(goal)])),
		tasksById: new Map(tasks.map((task) => [task.id as string, readTask(task)]))
	};
}

function readGoal(row: Record<string, unknown>): AgendaGoal {
	return { id: row.id as string, title: row.title as string, horizon: parseGoalHorizon(row.horizon) };
}

function readTask(row: Record<string, unknown>): PlacedTask {
	return { goalId: (row.goal_id as string | null) ?? null, parentTaskId: (row.parent_task_id as string | null) ?? null };
}

function goalOfItem(item: AgendaItem, board: ProjectGoals): AgendaGoal | null {
	const { subjectKind, subjectId } = item;
	if (subjectId === null) return null;
	if (subjectKind === subjectKinds.goal) return board.goalsById.get(subjectId) ?? null;
	const isOnATask = subjectKind === subjectKinds.task;
	const noTaskSeenYet = new Set<string>();
	return isOnATask ? goalOfTask(subjectId, board, noTaskSeenYet) : null;
}

function goalOfTask(taskId: string, board: ProjectGoals, visited: Set<string>): AgendaGoal | null {
	const task = board.tasksById.get(taskId);
	const isSeenAlready = visited.has(taskId);
	if (task === undefined || isSeenAlready) return null;
	visited.add(taskId);
	const ownGoal = task.goalId === null ? undefined : board.goalsById.get(task.goalId);
	if (ownGoal !== undefined) return ownGoal;
	if (task.parentTaskId === null) return null;
	return goalOfTask(task.parentTaskId, board, visited);
}
