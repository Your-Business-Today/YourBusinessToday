import { invoiceLineTotal } from './customerBalance';
import { sumMoney } from './money';
import { describeBillingPeriod, periodOfInvoice } from './billingPeriods';
import type { BillingScheduleSettings } from './billingSchedule';
import type { InvoiceLineInput } from './invoiceLineRules';

/** Where a schedule stands: raising invoices on their days, paused by a person, or past its last date. */
export const BillingScheduleStandings = { running: 'running', paused: 'paused', ended: 'ended' } as const;

export type BillingScheduleStanding = (typeof BillingScheduleStandings)[keyof typeof BillingScheduleStandings];

/** The invoice a schedule raises next: its date, what it comes to and the period it covers, in words. */
export type NextScheduledInvoice = { date: string; total: number; periodInWords: string };

type ScheduleToRead = Pick<BillingScheduleSettings, 'frequency' | 'covers' | 'nextInvoiceDate' | 'isPaused' | 'endsOn'> & {
	lines: InvoiceLineInput[];
};

/** Ended once its next invoice would fall after its last date; otherwise paused when a person paused it. */
export function standingOfSchedule(schedule: ScheduleToRead): BillingScheduleStanding {
	const isPastItsLastDate = schedule.endsOn !== null && schedule.nextInvoiceDate > schedule.endsOn;
	if (isPastItsLastDate) return BillingScheduleStandings.ended;
	if (schedule.isPaused) return BillingScheduleStandings.paused;
	return BillingScheduleStandings.running;
}

/** The next invoice as the schedule stands: dated its next invoice date, the sum of its lines, for its period. */
export function nextScheduledInvoice(schedule: ScheduleToRead): NextScheduledInvoice {
	const total = sumMoney(schedule.lines.map((line) => invoiceLineTotal(line.quantity, line.unitPrice)));
	const period = periodOfInvoice(schedule.nextInvoiceDate, schedule);
	return { date: schedule.nextInvoiceDate, total, periodInWords: describeBillingPeriod(period) };
}
