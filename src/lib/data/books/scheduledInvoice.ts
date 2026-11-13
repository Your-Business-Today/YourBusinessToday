import { isoDateDaysFrom } from '$lib/data/demo/demoDates';
import { describeBillingPeriod, periodOfInvoice, type BillingPeriod } from './billingPeriods';
import type { BillingScheduleSettings } from './billingSchedule';
import { standingOfSchedule, BillingScheduleStandings } from './billingScheduleStanding';
import type { InvoiceLineInput } from './invoiceLineRules';

/** A schedule as the run reads it: its settings, the customer it bills and its lines. */
export type ScheduleToRaise = BillingScheduleSettings & { id: string; customerId: string; lines: InvoiceLineInput[] };

/** The invoice a schedule raises on a day: its id made beforehand, its dates, its reference and the period it bills. */
export type ScheduledInvoice = { id: string; issueDate: string; dueDate: string; reference: string; period: BillingPeriod };

/** When the hourly run first raises a day's invoices, on a UK clock, so none goes out in the night. */
export const billingRunOpensAt = '07:00';

/** How many times the run emails an invoice that has not gone before it leaves it for a person. */
export const sendingAttemptLimit = 3;

/** Whether the schedule is running and its next invoice date has come. */
export function isScheduleDue(schedule: ScheduleToRaise, today: string): boolean {
	const isRunning = standingOfSchedule(schedule) === BillingScheduleStandings.running;
	return isRunning && schedule.nextInvoiceDate <= today;
}

/** The reference an invoice from the schedule prints: its title and its period in words, "Monthly fees: December 2026". */
export function scheduledReference(title: string, period: BillingPeriod): string {
	return `${title}: ${describeBillingPeriod(period)}`;
}

/** The invoice the schedule raises today for the period of its next invoice date, due after the days given to pay. */
export function scheduledInvoiceOf(schedule: ScheduleToRaise, today: string, booksPaymentTermsDays: number): ScheduledInvoice {
	const period = periodOfInvoice(schedule.nextInvoiceDate, schedule);
	const daysToPay = schedule.paymentTermsDays ?? booksPaymentTermsDays;
	return {
		id: crypto.randomUUID(),
		issueDate: today,
		dueDate: isoDateDaysFrom(today, daysToPay),
		reference: scheduledReference(schedule.title, period),
		period
	};
}
