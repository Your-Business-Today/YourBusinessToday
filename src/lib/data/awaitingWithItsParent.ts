import { isAwaitingDesignApproval, type DesignReview } from './designReview';

type ReviewedTask = { parentTaskId: string | null; designReview?: DesignReview | null };

/**
 * A task waits for YBT's approval when it does itself, or when the feature it is a chunk of does:
 * it belongs on the Requested tab, never on the board, until YBT approves it.
 */
export function isAwaitingWithItsParent(task: ReviewedTask, tasksById: Map<string, ReviewedTask>): boolean {
	const seenTaskIds = new Set<string>();
	let candidate: ReviewedTask | undefined = task;
	while (candidate !== undefined) {
		if (isAwaitingDesignApproval(candidate)) return true;
		const parentTaskId = candidate.parentTaskId;
		if (parentTaskId === null || seenTaskIds.has(parentTaskId)) return false;
		seenTaskIds.add(parentTaskId);
		candidate = tasksById.get(parentTaskId);
	}
	return false;
}
