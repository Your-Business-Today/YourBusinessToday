import { isTaskDone, taskStatusLabels } from '$lib/data/taskStatus';
import type { SequenceStep, TaskSequence } from '$lib/data/taskSequence';
import type { ProjectTask } from '$lib/server/projects/taskRecord';
import type { WaitedForTask } from '$lib/server/projects/getGlobalTaskPage';

export const notInASequence =
	'Sequence: not in one — set_task_waits_for puts it after the task it must follow.';

/** A task's place in its sequence, step by step, and the step still holding it up. */
export function sequenceLines(sequence: TaskSequence<ProjectTask> | null): string[] {
	if (sequence === null) return [notInASequence];
	const place = `Sequence: step ${sequence.thisStepNumber} of ${sequence.stepCount}, in order:`;
	return [place, ...sequence.steps.map(stepLine), waitingLine(sequence)].filter(
		(line) => line !== ''
	);
}

/** How a task in a list says what it waits for: nothing unless it is still held up. */
export function waitsForClause(task: { waitsFor: WaitedForTask | null }): string {
	const waitedFor = task.waitsFor;
	if (waitedFor === null || isTaskDone(waitedFor.status)) return '';
	return `, waiting for "${waitedFor.title}" (${taskStatusLabels[waitedFor.status]})`;
}

function stepLine(step: SequenceStep<ProjectTask>): string {
	const task = step.task;
	const marker = step.isThisTask ? ' ← this task' : '';
	const status = taskStatusLabels[task.status];
	return `  ${step.stepNumber}. ${task.title} — ${status} (id: ${task.id})${marker}`;
}

function waitingLine(sequence: TaskSequence<ProjectTask>): string {
	const waitingFor = sequence.waitingFor;
	if (waitingFor === null) return '';
	return `Waiting for "${waitingFor.title}" to be done before this task can start.`;
}
