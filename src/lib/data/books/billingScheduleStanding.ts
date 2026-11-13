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

/** A running schedule's next invoice, with the schedule it comes from. */
export type UpcomingScheduledInvoice<Schedule> = { schedule: Schedule; next: NextScheduledInvoice };

function byDate(first: NextScheduledInvoice, second: NextScheduledInvoice): number {
	return first.date.localeCompare(second.date);
}

/** The invoice that goes out next across the schedules that are running: the earliest date, then the first given. */
export function soonestScheduledInvoice<Schedule extends ScheduleToRead>(schedules: Schedule[]): UpcomingScheduledInvoice<Schedule> | null {
	const running = schedules.filter((schedule) => standingOfSchedule(schedule) === BillingScheduleStandings.running);
	const upcoming = running.map((schedule) => ({ schedule, next: nextScheduledInvoice(schedule) }));
	const soonestFirst = [...upcoming].sort((first, second) => byDate(first.next, second.next));
	return soonestFirst[0] ?? null;
}
