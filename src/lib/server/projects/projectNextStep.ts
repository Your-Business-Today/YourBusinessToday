import { currentWork, type HorizonedGoal } from '$lib/data/taskHorizons';
import { inProgressTaskStatus, isTaskDone } from '$lib/data/taskStatus';
import type { ConversationTurn } from '$lib/data/conversationTurn';
import type { ProjectTask } from './taskRecord';

/** The one task that moves the project on next, and whether it is a bug. */
export type NextStep = { projectId: string; taskId: string; title: string; isBug: boolean };

type NextStepSources = { tasks: ProjectTask[]; goals: HorizonedGoal[]; turnsByTask: Map<string, ConversationTurn> };

/** The highest open bug when there is one, else the current task already being built, else the highest open one nobody waits on. */
export function nextStepOf(sources: NextStepSources, openBugs: ProjectTask[]): NextStep | null {
	const [firstBug] = byPriority(openBugs);
	if (firstBug !== undefined) return stepOf(firstBug, true);
	const { tasks, goals, turnsByTask } = sources;
	const isFree = (task: ProjectTask) => !isTaskDone(task.status) && (turnsByTask.get(task.id)?.awaiting ?? null) === null;
	const candidates = byPriority(currentWork(tasks, goals).filter((task) => task.parentTaskId === null && isFree(task)));
	const next = candidates.find((task) => task.status === inProgressTaskStatus) ?? candidates.at(0);
	if (next === undefined) return null;
	return stepOf(next, false);
}

function stepOf(task: ProjectTask, isBug: boolean): NextStep {
	return { projectId: task.projectId, taskId: task.id, title: task.title, isBug };
}

function byPriority(tasks: ProjectTask[]): ProjectTask[] {
	return [...tasks].sort((left, right) => left.priority - right.priority);
}
