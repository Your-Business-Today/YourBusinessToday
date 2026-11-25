import type { NextAction } from './nextAction';

/** Who holds the next move on each task, as the page sends it: a build names nobody. */
export function nextActionIdsOf(nextActionsByTask: Map<string, NextAction>): Record<string, string[]> {
	const entries = [...nextActionsByTask].map(([taskId, nextAction]) => [taskId, nextAction.accountIds]);
	return Object.fromEntries(entries);
}

/** The tasks whose next move is this person's. */
export function taskIdsWithMoveOf(nextActionIdsByTask: Record<string, string[]>, accountId: string): string[] {
	const tasksWithMove = Object.entries(nextActionIdsByTask).filter(([, accountIds]) => accountIds.includes(accountId));
	return tasksWithMove.map(([taskId]) => taskId);
}
