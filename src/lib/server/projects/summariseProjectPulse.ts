import { inProgressTaskStatus, isTaskDone } from '$lib/data/taskStatus';
import { currentWork, type HorizonedGoal } from '$lib/data/taskHorizons';
import { weightedCompletionPercent } from '$lib/data/completionSummary';
import type { ConversationTurn } from '$lib/data/conversationTurn';
import type { ProjectTask } from './taskRecord';

export type ProjectPulse = {
	taskCount: number;
	currentTaskCount: number;
	openTaskCount: number;
	openCurrentTaskCount: number;
	inProgressCount: number;
	completionPercent: number;
	waitingOnViewerCount: number;
	assignedToViewerCount: number;
};

export type PulseSources = {
	tasks: ProjectTask[];
	goals: HorizonedGoal[];
	assigneeIdsByTask: Map<string, string[]>;
	turnsByTask: Map<string, ConversationTurn>;
	viewerId: string;
};

/** The open tile, the completion and the assignments are current work's: a task under a long term goal counts toward neither. */
export function summariseProjectPulse(sources: PulseSources): ProjectPulse {
	const { tasks } = sources;
	const openTasks = tasks.filter((task) => !isTaskDone(task.status));
	const currentTasks = currentWork(tasks, sources.goals);
	const openCurrentTasks = currentTasks.filter((task) => !isTaskDone(task.status));
	return {
		taskCount: tasks.length,
		currentTaskCount: currentTasks.length,
		openTaskCount: openTasks.length,
		openCurrentTaskCount: openCurrentTasks.length,
		inProgressCount: openCurrentTasks.filter((task) => task.status === inProgressTaskStatus).length,
		completionPercent: weightedCompletionPercent(currentTasks),
		waitingOnViewerCount: openTasks.filter((task) => isWaitingOnViewer(task, sources)).length,
		assignedToViewerCount: openCurrentTasks.filter((task) => isAssignedToViewer(task, sources)).length
	};
}

function isWaitingOnViewer(task: ProjectTask, sources: PulseSources): boolean {
	const awaiting = sources.turnsByTask.get(task.id)?.awaiting ?? null;
	return awaiting?.accountId === sources.viewerId;
}

function isAssignedToViewer(task: ProjectTask, sources: PulseSources): boolean {
	const assigneeIds = sources.assigneeIdsByTask.get(task.id) ?? [];
	return assigneeIds.includes(sources.viewerId);
}
