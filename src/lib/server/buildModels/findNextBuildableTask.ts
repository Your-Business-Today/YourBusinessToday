import type { SupabaseClient } from '@supabase/supabase-js';
import { isHeldByAnother } from '$lib/data/lifecycleClaim';
import { isTaskAutocomplete } from '$lib/data/autocomplete';
import { hasLeftTheBuildQueue } from '$lib/data/lifecycleStep';
import { modelNeededFor } from '$lib/data/taskModel';
import { getLifecycleMarks, type LifecycleMark } from '$lib/server/lifecycle/getLifecycleMarks';
import { readBuildCandidates, type BuildCandidate } from './readBuildCandidates';
import type { BuildModel } from '$lib/data/buildModels';
import type { ProjectTask } from '$lib/server/projects/taskRecord';

export type BuildSearch = { projectIds: string[]; modelId: string; agent: string; models: BuildModel[] };

/** The highest queued task that is buildable, autocomplete, needs this model, has not been built yet and nobody else holds. */
export async function findNextBuildableTask(
	supabase: SupabaseClient,
	search: BuildSearch
): Promise<ProjectTask | null> {
	const { projectIds } = search;
	const candidates = await readBuildCandidates(supabase, projectIds);
	if (candidates.length === 0) return null;
	const marks = await getLifecycleMarks(supabase, projectIds);
	const next = candidates.find((candidate) => isFreeFor(candidate, search, marks));
	return next?.task ?? null;
}

function isFreeFor(candidate: BuildCandidate, search: BuildSearch, marks: Map<string, LifecycleMark>): boolean {
	const { task } = candidate;
	const isAutocomplete = isTaskAutocomplete(task.autocompleteSetting, candidate.isGoalAutocomplete);
	const model = modelNeededFor(task, search.models);
	const isForThisModel = model?.modelId === search.modelId;
	if (!isAutocomplete || candidate.isWaiting || !isForThisModel) return false;
	const latest = marks.get(task.id)?.latest ?? null;
	const isHandedOn = latest !== null && hasLeftTheBuildQueue(latest.step);
	if (isHandedOn) return false;
	const taskClaim = marks.get(task.id)?.claim ?? null;
	const goalClaim = marks.get(task.goalId ?? '')?.claim ?? null;
	return !isHeldByAnother(taskClaim, search.agent) && !isHeldByAnother(goalClaim, search.agent);
}
