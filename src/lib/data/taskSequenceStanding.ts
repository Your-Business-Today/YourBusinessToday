import { isTaskDone, type TaskStatus } from './taskStatus';
import { comesAfter, type SequencedTask } from './taskSequence';
import { taskWaitedFor } from './taskSequenceSteps';

/** The task another waits for, as a list shows it: its name, and whether it still holds the task up. */
export type SequenceStanding = { waitedForId: string; waitedForTitle: string; isWaiting: boolean };

type WaitedForTask = { id: string; title: string; status: TaskStatus };

export const startsWhenever = 'Starts whenever — waits for no task';

export function sequenceStandingOf(
	task: { status: TaskStatus },
	waitedFor: WaitedForTask | null
): SequenceStanding | null {
	if (waitedFor === null || isTaskDone(task.status)) return null;
	return {
		waitedForId: waitedFor.id,
		waitedForTitle: waitedFor.title,
		isWaiting: !isTaskDone(waitedFor.status)
	};
}

/** Each task's standing in its sequence, keyed by task id, for the tasks that wait for one. */
export function sequenceStandingsOf<Task extends SequencedTask>(
	tasks: Task[]
): Record<string, SequenceStanding> {
	const standings: Record<string, SequenceStanding> = {};
	for (const task of tasks) {
		const standing = sequenceStandingOf(task, taskWaitedFor(task, tasks));
		if (standing !== null) standings[task.id] = standing;
	}
	return standings;
}

/** The tasks a task may wait for: the open ones that do not come after it, and the one it waits for now. */
export function sequenceChoicesFor<Task extends SequencedTask>(task: Task, tasks: Task[]): Task[] {
	return tasks.filter((candidate) => {
		if (candidate.id === task.waitsForTaskId) return true;
		if (isTaskDone(candidate.status)) return false;
		return !comesAfter(candidate, task, tasks);
	});
}

/** Why a task cannot wait for the chosen task, or null when it can. */
export function waitsForRefusal<Task extends SequencedTask>(
	task: Task,
	chosenTaskId: string | null,
	tasks: Task[]
): string | null {
	if (chosenTaskId === null) return null;
	const chosen = tasks.find((candidate) => candidate.id === chosenTaskId);
	if (chosen === undefined) return 'A task waits for a task on its own project — no task there has that id.';
	if (chosen.id === task.id) return 'A task cannot wait for itself.';
	if (comesAfter(chosen, task, tasks)) {
		return `"${chosen.title}" comes after this task, so this task cannot wait for it.`;
	}
	return null;
}
