import { isTaskAutocomplete } from '$lib/data/autocomplete';
import { modelNeededFor } from '$lib/data/taskModel';
import { isQueued, type BuildCandidate } from './readBuildCandidates';
import type { BuildModel } from '$lib/data/buildModels';
import type { LifecycleMark } from '$lib/server/lifecycle/getLifecycleMarks';

export type BuildQueueEntry = {
	taskId: string;
	title: string;
	projectId: string;
	projectName: string;
	storyPoints: number;
	modelId: string | null;
	namedModelId: string | null;
	isAutocomplete: boolean;
	isWaiting: boolean;
	queuePlace: number | null;
	latestStep: string | null;
	heldBy: string | null;
};

/** One line of the build board for each candidate: what it is, the model it needs and who holds it. */
export function buildQueueEntries(
	candidates: BuildCandidate[],
	marks: Map<string, LifecycleMark>,
	models: BuildModel[]
): BuildQueueEntry[] {
	return candidates.map((candidate) => buildQueueEntry(candidate, marks, models));
}

function buildQueueEntry(
	candidate: BuildCandidate,
	marks: Map<string, LifecycleMark>,
	models: BuildModel[]
): BuildQueueEntry {
	const { task, projectName, goalSetting, isWaiting } = candidate;
	const mark = marks.get(task.id);
	const goalMark = marks.get(task.goalId ?? '');
	const claim = mark?.claim ?? goalMark?.claim ?? null;
	const latest = mark?.latest;
	return {
		taskId: task.id,
		title: task.title,
		projectId: task.projectId,
		projectName,
		storyPoints: task.storyPoints,
		modelId: modelNeededFor(task, models)?.modelId ?? null,
		namedModelId: task.modelNeeded,
		isAutocomplete: isTaskAutocomplete(task.autocompleteSetting, goalSetting),
		isWaiting,
		queuePlace: isQueued(candidate) ? candidate.queuePlace : null,
		latestStep: latest?.step ?? null,
		heldBy: claim?.agent ?? null
	};
}
