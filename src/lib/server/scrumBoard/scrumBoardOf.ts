import { badgeOf } from '$lib/data/lifecycleBadge';
import { buildStageOf } from '$lib/data/buildStageOf';
import { departments } from '$lib/data/department';
import { developmentKindOfTask } from '$lib/data/developmentKind';
import { isInternalWork } from '$lib/data/boardSide';
import { modelNeededFor } from '$lib/data/taskModel';
import { scrumColumnsOf, workKinds, type ScrumBoard, type ScrumCard, type WorkKind } from '$lib/data/scrumBoard';
import { weeklyVelocityOf } from '$lib/data/weeklyVelocity';
import type { BuildFacts } from '$lib/server/lifecycle/buildFacts';
import type { LifecycleMark } from '$lib/server/lifecycle/getLifecycleMarks';
import type { ProjectTask } from '$lib/server/projects/taskRecord';

export type ScrumBoardSources = BuildFacts & {
	projectTasks: ProjectTask[];
	doneAtByTask: Map<string, string>;
	now: Date;
};

/** The Development side as a scrum board: every bug, feature and infrastructure task in its build stage, and the weekly velocity. */
export function scrumBoardOf(sources: ScrumBoardSources): ScrumBoard {
	const tasksById = new Map(sources.projectTasks.map((task) => [task.id, task]));
	const developmentTasks = sources.projectTasks.filter((task) => !isInternalWork(task.department));
	const cards = developmentTasks.flatMap((task) => cardsFor(task, sources, tasksById));
	return { columns: scrumColumnsOf(cards), velocity: weeklyVelocityOf(sources.projectTasks, sources.now) };
}

function cardsFor(task: ProjectTask, sources: ScrumBoardSources, tasksById: Map<string, ProjectTask>): ScrumCard[] {
	const mark = sources.marks.get(task.id);
	const doneAt = sources.doneAtByTask.get(task.id) ?? null;
	const stage = buildStageOf(task, { latestStep: latestStepOf(mark), doneAt, now: sources.now });
	if (stage === null) return [];
	const workKind = workKindOf(task, tasksById);
	return [
		{
			id: task.id,
			projectId: task.projectId,
			title: task.title,
			stage,
			workKind,
			storyPoints: task.storyPoints,
			modelLabel: modelLabelFor(task, workKind, sources),
			lifecycle: mark === undefined ? null : badgeOf(mark),
			pullRequestUrl: task.pullRequestUrl
		}
	];
}

function latestStepOf(mark: LifecycleMark | undefined) {
	if (mark === undefined) return null;
	const { latest } = mark;
	return latest.step;
}

function workKindOf(task: ProjectTask, tasksById: Map<string, ProjectTask>): WorkKind {
	if (task.department === departments.infrastructure) return workKinds.infrastructure;
	return developmentKindOfTask(task, tasksById);
}

/** The model a built task needs, by name or by its points; infrastructure is set by hand and needs none. */
function modelLabelFor(task: ProjectTask, workKind: WorkKind, sources: ScrumBoardSources): string | null {
	if (workKind === workKinds.infrastructure) return null;
	const model = modelNeededFor(task, sources.buildModels);
	return model === null ? null : model.label;
}
