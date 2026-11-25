import { monthOfDay, shiftMonth, type MonthKey } from '../monthKey';

/** The months a line dated on the day covers, counted from the month it is dated. */
export function monthsCoveredFrom(journalDate: string, monthsCovered: number): MonthKey[] {
	const firstMonth = monthOfDay(journalDate);
	return Array.from({ length: monthsCovered }, (_, offset) => shiftMonth(firstMonth, offset));
}
