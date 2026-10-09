import { taskStatuses } from '$lib/data/taskStatus';
import type { SequencedTask, TaskSequence } from '$lib/data/taskSequence';

export type WaitingNote = { headline: string; withWhom: string };

/**
 * What the top of a task page says about its place in a sequence: that it is
 * waiting for an earlier step, or that the step before is done and it can start.
 * Nothing when it is under way, done, or not in a sequence.
 */
export function waitingNoteSentence<Task extends SequencedTask>(
	task: Task,
	sequence: TaskSequence<Task> | null,
	waitedForAssigneeNames: string[]
): WaitingNote | null {
	if (sequence === null) return null;
	const { stepCount, thisStepNumber, waitingForStepNumber } = sequence;
	if (waitingForStepNumber !== null) {
		return {
			headline: `Waiting for step ${waitingForStepNumber} of ${stepCount} to be done before this can start`,
			withWhom: withWhomSentence(waitedForAssigneeNames)
		};
	}
	if (task.status !== taskStatuses.backlog || thisStepNumber === 1) return null;
	return {
		headline: `Ready to start — step ${thisStepNumber - 1} is done, and this is step ${thisStepNumber} of ${stepCount}`,
		withWhom: ''
	};
}

function withWhomSentence(assigneeNames: string[]): string {
	if (assigneeNames.length === 0) return ', assigned to nobody yet';
	return `, with ${assigneeNames.join(', ')}`;
}
