import type { SupabaseClient } from '@supabase/supabase-js';
import { doneTaskStatus, isTaskDone, parseTaskStatus } from '$lib/data/taskStatus';
import { onHoldProjectStatus } from '$lib/data/projectStatus';
import { departments } from '$lib/data/department';
import { isBugTitle } from '$lib/data/developmentKind';
import { parseTaskRecord, type ProjectTask } from '$lib/server/projects/taskRecord';
import { isHeldForDesignReview, parseDesignReview, type DesignReview } from '$lib/data/designReview';
import { goalsAwaitingApproval } from '$lib/server/designReviews/goalsAwaitingApproval';

const candidatesRead = 200;

const candidateColumns =
	'*, project:project_id!inner(name, status), goal:goal_id(is_autocomplete), waits_for:waits_for_task_id(status), parent:parent_task_id(global_priority, title, design_review_state)';

const unqueued = Number.POSITIVE_INFINITY;

export type BuildCandidate = {
	task: ProjectTask;
	projectName: string;
	isGoalAutocomplete: boolean | null;
	isWaiting: boolean;
	queuePlace: number;
	isBug: boolean;
	parentDesignReview?: DesignReview | null;
};

/**
 * Every open buildable development task on the projects not on hold, in the order the queue will take them; a task
 * that changes the design and has not been approved by YBT is never one of them, nor any task of a goal holding one.
 */
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
		.eq('department', departments.development)
		.neq('status', doneTaskStatus)
		.neq('project.status', onHoldProjectStatus)
		.order('priority', { ascending: true })
		.limit(candidatesRead);
	if (error) throw error;
	const candidates = (data ?? []).map(parseCandidate).filter(isFreeOfDesignReview);
	const heldGoalIds = await goalsAwaitingApproval(supabase, candidates.map(({ task }) => task.goalId));
	return candidates.filter(({ task }) => task.goalId === null || !heldGoalIds.has(task.goalId)).sort(byQueuePlace);
}

function isFreeOfDesignReview(candidate: BuildCandidate): boolean {
	const { task, parentDesignReview } = candidate;
	return !isHeldForDesignReview(task) && !isHeldForDesignReview({ designReview: parentDesignReview ?? null });
}

export function isQueued(candidate: BuildCandidate): boolean {
	return Number.isFinite(candidate.queuePlace);
}

function parseCandidate(row: Record<string, unknown>): BuildCandidate {
	const project = row.project as { name?: string } | null;
	const goal = row.goal as { is_autocomplete?: boolean } | null;
	const waitedFor = row.waits_for as { status?: string } | null;
	const parent = row.parent as ({ global_priority?: number | null; title?: string } & Record<string, unknown>) | null;
	const isWaiting = waitedFor !== null && !isTaskDone(parseTaskStatus(waitedFor.status));
	const task = parseTaskRecord(row);
	const queuePlace = task.globalPriority ?? parent?.global_priority ?? unqueued;
	const projectName = project?.name ?? '';
	const isBug = isBugTitle(parent?.title ?? task.title);
	const parentDesignReview = parent === null ? null : parseDesignReview(parent);
	const isGoalAutocomplete = goal?.is_autocomplete ?? null;
	return { task, projectName, isGoalAutocomplete, isWaiting, queuePlace, isBug, parentDesignReview };
}

/**
 * Bugs before features, because a bug is something already built that has stopped working; then
 * by place in the queue, a subtask taking its parent's, so a review follows the work it reviews.
 */
export function byQueuePlace(first: BuildCandidate, second: BuildCandidate): number {
	if (first.isBug !== second.isBug) return first.isBug ? -1 : 1;
	return first.queuePlace - second.queuePlace;
}
