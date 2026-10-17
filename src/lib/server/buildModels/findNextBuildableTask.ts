import type { SupabaseClient } from '@supabase/supabase-js';
import { isHeldByAnother } from '$lib/data/lifecycleClaim';
import { isTaskAutocomplete } from '$lib/data/autocomplete';
import { doneTaskStatus, isTaskDone, parseTaskStatus } from '$lib/data/taskStatus';
import { modelNeededFor } from '$lib/data/taskModel';
import { parseTaskRecord, type ProjectTask } from '$lib/server/projects/taskRecord';
import { getLifecycleMarks, type LifecycleMark } from '$lib/server/lifecycle/getLifecycleMarks';
import type { BuildModel } from '$lib/data/buildModels';

const candidatesRead = 200;

const candidateColumns =
	'*, goal:goal_id(is_autocomplete), waits_for:waits_for_task_id(status), parent:parent_task_id(global_priority)';

const unqueued = Number.POSITIVE_INFINITY;

type Candidate = { task: ProjectTask; goalSetting: boolean | null; isWaiting: boolean; queuePlace: number };

export type BuildSearch = { projectIds: string[]; modelId: string; agent: string; models: BuildModel[] };

/** The highest queued task that is buildable, autocomplete, needs this model and nobody else holds. */
export async function findNextBuildableTask(
	supabase: SupabaseClient,
	search: BuildSearch
): Promise<ProjectTask | null> {
	const { projectIds } = search;
	if (projectIds.length === 0) return null;
	const { data, error } = await supabase
		.from('tasks')
		.select(candidateColumns)
		.in('project_id', projectIds)
		.eq('is_buildable', true)
		.neq('status', doneTaskStatus)
		.order('priority', { ascending: true })
		.limit(candidatesRead);
	if (error) throw error;
	const marks = await getLifecycleMarks(supabase, projectIds);
	const candidates = (data ?? []).map(parseCandidate).sort(byQueuePlace);
	const next = candidates.find((candidate) => isFreeFor(candidate, search, marks));
	return next?.task ?? null;
}

function parseCandidate(row: Record<string, unknown>): Candidate {
	const goal = row.goal as { is_autocomplete?: boolean } | null;
	const waitedFor = row.waits_for as { status?: string } | null;
	const parent = row.parent as { global_priority?: number | null } | null;
	const isWaiting = waitedFor !== null && !isTaskDone(parseTaskStatus(waitedFor.status));
	const task = parseTaskRecord(row);
	const queuePlace = task.globalPriority ?? parent?.global_priority ?? unqueued;
	return { task, goalSetting: goal?.is_autocomplete ?? null, isWaiting, queuePlace };
}

/** A subtask takes its parent's place in the queue, so a review follows the work it reviews. */
function byQueuePlace(first: Candidate, second: Candidate): number {
	return first.queuePlace - second.queuePlace;
}

function isFreeFor(candidate: Candidate, search: BuildSearch, marks: Map<string, LifecycleMark>): boolean {
	const { task } = candidate;
	const isAutocomplete = isTaskAutocomplete(task.autocompleteSetting, candidate.goalSetting);
	const model = modelNeededFor(task, search.models);
	const isForThisModel = model?.modelId === search.modelId;
	if (!isAutocomplete || candidate.isWaiting || !isForThisModel) return false;
	const taskClaim = marks.get(task.id)?.claim ?? null;
	const goalClaim = marks.get(task.goalId ?? '')?.claim ?? null;
	return !isHeldByAnother(taskClaim, search.agent) && !isHeldByAnother(goalClaim, search.agent);
}
