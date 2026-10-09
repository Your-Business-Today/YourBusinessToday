import type { SequencedTask } from './taskSequence';

export function taskWaitedFor<Task extends SequencedTask>(task: Task, tasks: Task[]): Task | null {
	if (task.waitsForTaskId === null) return null;
	return tasks.find((candidate) => candidate.id === task.waitsForTaskId) ?? null;
}

/** The tasks that wait for this one, in the order they are worked. */
export function followersOf<Task extends SequencedTask>(task: Task, tasks: Task[]): Task[] {
	return tasks.filter((candidate) => candidate.waitsForTaskId === task.id).sort(byPriorityThenAge);
}

/** The chain of tasks before this one, earliest first, stopping where it would loop. */
export function stepsBefore<Task extends SequencedTask>(task: Task, tasks: Task[]): Task[] {
	const before: Task[] = [];
	const seenIds = new Set([task.id]);
	let earlier = taskWaitedFor(task, tasks);
	while (earlier !== null && !seenIds.has(earlier.id)) {
		seenIds.add(earlier.id);
		before.unshift(earlier);
		earlier = taskWaitedFor(earlier, tasks);
	}
	return before;
}

/** The chain after this one, following the first follower at each step, skipping any step already placed. */
export function stepsAfter<Task extends SequencedTask>(
	task: Task,
	tasks: Task[],
	seenIds: Set<string>
): Task[] {
	const after: Task[] = [];
	seenIds.add(task.id);
	let next = followersOf(task, tasks).at(0) ?? null;
	while (next !== null && !seenIds.has(next.id)) {
		seenIds.add(next.id);
		after.push(next);
		next = followersOf(next, tasks).at(0) ?? null;
	}
	return after;
}

function byPriorityThenAge(left: SequencedTask, right: SequencedTask): number {
	if (left.priority !== right.priority) return left.priority - right.priority;
	return left.createdAt.localeCompare(right.createdAt);
}
