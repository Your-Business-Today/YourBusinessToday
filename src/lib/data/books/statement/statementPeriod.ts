import { validateIsoDate } from '../isoDate';

/** The days an account's entries are listed for: from the first day, or from the start of the books, to the last. */
export type StatementPeriod = { start: string | null; end: string };

/** The period as given, or why it is refused: a real last day, and a real first day no later than it when one is given. */
export function validateStatementPeriod(start: unknown, end: unknown): StatementPeriod | string {
	const endRefusal = validateIsoDate('periodEnd', end);
	if (endRefusal !== null) return endRefusal;
	const endDay = end as string;
	const isFromTheStart = start === undefined || start === null || start === '';
	if (isFromTheStart) return { start: null, end: endDay };
	const startRefusal = validateIsoDate('periodStart', start);
	if (startRefusal !== null) return startRefusal;
	const startDay = start as string;
	if (startDay > endDay) return `periodStart (${startDay}) is after periodEnd (${endDay}).`;
	return { start: startDay, end: endDay };
}

/** Whether a day falls before the period opens, so its entries make up the opening balance. */
export function isBeforePeriod(isoDate: string, period: StatementPeriod): boolean {
	return period.start !== null && isoDate < period.start;
}
