import { ukClockAt } from './ukClock';

/** A due date has passed when the UK calendar has moved beyond it and the work is still unfinished. */
export function isPastDue(dueDate: string | null, isFinished: boolean, now: Date = new Date()): boolean {
	if (dueDate === null || isFinished) return false;
	const today = ukClockAt(now).date;
	return dueDate < today;
}
