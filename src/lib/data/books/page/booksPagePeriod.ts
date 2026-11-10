import { validateIsoDate } from '../isoDate';
import { financialYearStart, validateReportPeriod, type ReportPeriod } from '../reports/reportPeriod';
import { PeriodFieldNames, type AskedPeriod } from './booksPeriodQuery';

/**
 * The days the books page shows. A last day not asked for is today, and a first day not asked for is the first
 * of the financial year the last day falls in. A period that is not two real days in order is refused, by name.
 */
export function booksPagePeriod(asked: AskedPeriod, today: string, yearStartMonth: number): ReportPeriod | string {
	const periodEnd = asked.periodEnd ?? today;
	const isRealEnd = validateIsoDate(PeriodFieldNames.end, periodEnd) === null;
	const yearHoldingTheEnd = isRealEnd ? periodEnd : today;
	const periodStart = asked.periodStart ?? financialYearStart(yearHoldingTheEnd, yearStartMonth);
	return validateReportPeriod(periodStart, periodEnd, yearStartMonth);
}
