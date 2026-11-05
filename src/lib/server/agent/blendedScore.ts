import type { AgendaItem } from './agendaItem';

/**
 * Priority and difficulty in one number, lower first: the task's place among its siblings times its
 * story points. A small job a little lower down can come before a big one at the top, and a big job
 * lower down waits longest. Work on no task has no score and comes after the work that has one.
 */
export function blendedScore(item: AgendaItem): number | null {
	const { taskPriority, storyPoints } = item;
	if (taskPriority === null || storyPoints === null) return null;
	return Math.max(taskPriority, 1) * storyPoints;
}

/** Scored work first, the lowest score first; unscored work after it, as it came. */
export function byBlendedScore(left: AgendaItem, right: AgendaItem): number {
	const leftScore = blendedScore(left);
	const rightScore = blendedScore(right);
	if (leftScore === rightScore) return 0;
	if (leftScore === null) return 1;
	if (rightScore === null) return -1;
	return leftScore - rightScore;
}
