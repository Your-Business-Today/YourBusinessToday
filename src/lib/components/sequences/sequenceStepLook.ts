import { isTaskDone, taskStatuses, type TaskStatus } from '$lib/data/taskStatus';

export type StepLook = { nodeClasses: string; caption: string; mark: string };

type LookedAtStep = { status: TaskStatus; isThisTask: boolean; isWaitedFor: boolean; stepNumber: number };

const doneClasses = 'border-go bg-go/20 text-go';
const thisTaskClasses = 'border-chalk bg-carriage text-chalk ring-4 ring-chalk/15';
const waitedForClasses = 'border-signal bg-signal/20 text-signal ring-4 ring-signal/20 animate-pulse';
const inProgressClasses = 'border-caution bg-caution/15 text-caution';
const laterClasses = 'border-dashed border-chalk/30 text-chalk/40';

const captions: Record<TaskStatus, string> = {
	backlog: 'next',
	in_progress: 'in progress',
	on_hold: 'on hold',
	done: 'done'
};

/** How one step of a sequence is drawn: ticked when done, ringed when it is this task, pulsing when it holds this task up. */
export function stepLook(step: LookedAtStep): StepLook {
	const mark = isTaskDone(step.status) ? '✓' : `${step.stepNumber}`;
	const caption = step.isThisTask ? 'this task' : captions[step.status];
	return { nodeClasses: nodeClassesFor(step), caption, mark };
}

function nodeClassesFor(step: LookedAtStep): string {
	if (isTaskDone(step.status)) return doneClasses;
	if (step.isWaitedFor) return waitedForClasses;
	if (step.isThisTask) return thisTaskClasses;
	if (step.status === taskStatuses.inProgress) return inProgressClasses;
	return laterClasses;
}
