import type { SupabaseClient } from '@supabase/supabase-js';
import { doneTaskStatus, isTaskDone, parseTaskStatus } from '$lib/data/taskStatus';
import { parseTaskRecord, type ProjectTask } from '$lib/server/projects/taskRecord';

const candidatesRead = 200;

const candidateColumns =
	'*, project:project_id(name), goal:goal_id(is_autocomplete), waits_for:waits_for_task_id(status), parent:parent_task_id(global_priority)';

const unqueued = Number.POSITIVE_INFINITY;

export type BuildCandidate = {
	task: ProjectTask;
	projectName: string;
	goalSetting: boolean | null;
	isWaiting: boolean;
	queuePlace: number;
};

/** Every open buildable task on the projects, in the order the queue will take them. */
export async function readBuildCandidates(
	supabase: SupabaseClient,
	projectIds: string[]
): Promise<BuildCandidate[]> {
	if (projectIds.length === 0) return [];
	const { data, error } = await supabase
		.from('tasks')
		.select(candidateColumns)
		.in('project_id', projectIds)
		.eq('is_buildable', true)
		.neq('status', doneTaskStatus)
		.order('priority', { ascending: true })
		.limit(candidatesRead);
	if (error) throw error;
	return (data ?? []).map(parseCandidate).sort(byQueuePlace);
}

export function isQueued(candidate: BuildCandidate): boolean {
	return Number.isFinite(candidate.queuePlace);
}

function parseCandidate(row: Record<string, unknown>): BuildCandidate {
	const project = row.project as { name?: string } | null;
	const goal = row.goal as { is_autocomplete?: boolean } | null;
	const waitedFor = row.waits_for as { status?: string } | null;
	const parent = row.parent as { global_priority?: number | null } | null;
	const isWaiting = waitedFor !== null && !isTaskDone(parseTaskStatus(waitedFor.status));
	const task = parseTaskRecord(row);
	const queuePlace = task.globalPriority ?? parent?.global_priority ?? unqueued;
	const projectName = project?.name ?? '';
	return { task, projectName, goalSetting: goal?.is_autocomplete ?? null, isWaiting, queuePlace };
}

/** A subtask takes its parent's place in the queue, so a review follows the work it reviews. */
function byQueuePlace(first: BuildCandidate, second: BuildCandidate): number {
	return first.queuePlace - second.queuePlace;
}
