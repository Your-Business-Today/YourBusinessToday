import { isTaskDone, type TaskStatus } from './taskStatus';
import { stepsAfter, stepsBefore, taskWaitedFor } from './taskSequenceSteps';

/** What a sequence reads off a task: where it sits in the chain and whether it is done. */
export type SequencedTask = {
	id: string;
	title: string;
	status: TaskStatus;
	waitsForTaskId: string | null;
	priority: number;
	createdAt: string;
};

export type SequenceStep<Task extends SequencedTask> = {
	task: Task;
	stepNumber: number;
	isThisTask: boolean;
	isWaitedFor: boolean;
};

/** The chain a task sits in: every step in order, this task's place, and the step still holding it up. */
export type TaskSequence<Task extends SequencedTask> = {
	steps: SequenceStep<Task>[];
	stepCount: number;
	thisStepNumber: number;
	waitingFor: Task | null;
	waitingForStepNumber: number | null;
};

/** The task still holding this one up: the one it waits for, while that is not done. */
export function taskWaitingFor<Task extends SequencedTask>(task: Task, tasks: Task[]): Task | null {
	if (isTaskDone(task.status)) return null;
	const waitedFor = taskWaitedFor(task, tasks);
	if (waitedFor === null || isTaskDone(waitedFor.status)) return null;
	return waitedFor;
}

/** Whether the candidate's chain of earlier tasks reaches the task, or is it. */
export function comesAfter<Task extends SequencedTask>(
	candidate: Task,
	earlier: Task,
	tasks: Task[]
): boolean {
	if (candidate.id === earlier.id) return true;
	return stepsBefore(candidate, tasks).some((step) => step.id === earlier.id);
}

export function readTaskSequence<Task extends SequencedTask>(
	task: Task,
	tasks: Task[]
): TaskSequence<Task> | null {
	const before = stepsBefore(task, tasks);
	const after = stepsAfter(task, tasks, new Set(before.map((step) => step.id)));
	if (before.length === 0 && after.length === 0) return null;
	const chain = [...before, task, ...after];
	const waitingFor = taskWaitingFor(task, tasks);
	const steps = chain.map((step, index) => ({
		task: step,
		stepNumber: index + 1,
		isThisTask: step.id === task.id,
		isWaitedFor: step.id === waitingFor?.id
	}));
	const waitingStep = steps.find((step) => step.isWaitedFor);
	return {
		steps,
		stepCount: steps.length,
		thisStepNumber: before.length + 1,
		waitingFor,
		waitingForStepNumber: waitingStep?.stepNumber ?? null
	};
}
