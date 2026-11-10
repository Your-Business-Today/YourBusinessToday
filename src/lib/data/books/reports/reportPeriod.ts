import { validateIsoDate } from '../isoDate';

/** The days a profit and loss covers, and the first day of the financial year its last day falls in. */
export type ReportPeriod = { start: string; end: string; yearStart: string };

/** The period as given, or why it is refused: two real days, the first no later than the last. */
export function validateReportPeriod(start: unknown, end: unknown, yearStartMonth: number): ReportPeriod | string {
	const startRefusal = validateIsoDate('periodStart', start);
	if (startRefusal !== null) return startRefusal;
	const endRefusal = validateIsoDate('periodEnd', end);
	if (endRefusal !== null) return endRefusal;
	const startDay = start as string;
	const endDay = end as string;
	if (startDay > endDay) return `periodStart (${startDay}) is after periodEnd (${endDay}).`;
	return { start: startDay, end: endDay, yearStart: financialYearStart(endDay, yearStartMonth) };
}

/** The first day of the financial year holding the day, for a year that starts in the given month (1 to 12). */
export function financialYearStart(isoDate: string, yearStartMonth: number): string {
	const [year, month] = isoDate.split('-').map(Number);
	const startYear = month >= yearStartMonth ? year : year - 1;
	const startMonth = String(yearStartMonth).padStart(2, '0');
	return `${startYear}-${startMonth}-01`;
}
