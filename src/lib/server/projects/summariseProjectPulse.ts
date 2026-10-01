import { inProgressTaskStatus, isTaskDone } from '$lib/data/taskStatus';
import { weightedCompletionPercent } from '$lib/data/completionSummary';
import type { ConversationTurn } from '$lib/data/conversationTurn';
import type { ProjectTask } from './taskRecord';

export type ProjectPulse = {
	taskCount: number;
	openTaskCount: number;
	inProgressCount: number;
	completionPercent: number;
	waitingOnViewerCount: number;
	assignedToViewerCount: number;
};

export type PulseSources = {
	tasks: ProjectTask[];
	assigneeIdsByTask: Map<string, string[]>;
	turnsByTask: Map<string, ConversationTurn>;
	viewerId: string;
};

export function summariseProjectPulse(sources: PulseSources): ProjectPulse {
	const { tasks } = sources;
	const openTasks = tasks.filter((task) => !isTaskDone(task.status));
	return {
		taskCount: tasks.length,
		openTaskCount: openTasks.length,
		inProgressCount: openTasks.filter((task) => task.status === inProgressTaskStatus).length,
		completionPercent: weightedCompletionPercent(tasks),
		waitingOnViewerCount: openTasks.filter((task) => isWaitingOnViewer(task, sources)).length,
		assignedToViewerCount: openTasks.filter((task) => isAssignedToViewer(task, sources)).length
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
