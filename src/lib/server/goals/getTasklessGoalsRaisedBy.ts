import { currentGoalHorizon } from '$lib/data/goalHorizon';
import { openGoalStatus } from '$lib/data/goalStatus';
import { parseGoalRecord, type Goal } from './goalRecord';
import type { SupabaseClient } from '@supabase/supabase-js';

/** An open goal its raiser never gave a task, with the project it sits on. */
export type TasklessGoal = Goal & { projectName: string };

const goalWithTaskCountColumns = '*, projects(name), tasks(count)';

/** The open current goals a person raised on these projects that still have no task under them; a long term goal waits for its tasks by design. */
export async function getTasklessGoalsRaisedBy(
	supabase: SupabaseClient,
	projectIds: string[],
	accountId: string
): Promise<TasklessGoal[]> {
	if (projectIds.length === 0) return [];
	const { data, error } = await supabase
		.from('goals')
		.select(goalWithTaskCountColumns)
		.in('project_id', projectIds)
		.eq('created_by', accountId)
		.eq('status', openGoalStatus)
		.eq('horizon', currentGoalHorizon)
		.order('created_at', { ascending: true });
	if (error) throw error;
	const rows = (data ?? []) as Record<string, unknown>[];
	return rows.filter(hasNoTasks).map(parseTasklessGoal);
}

function hasNoTasks(row: Record<string, unknown>): boolean {
	const [taskCount] = (row.tasks ?? []) as { count: number }[];
	return (taskCount?.count ?? 0) === 0;
}

function parseTasklessGoal(row: Record<string, unknown>): TasklessGoal {
	const project = row.projects as { name: string } | null;
	return { ...parseGoalRecord(row), projectName: project?.name ?? '' };
}
