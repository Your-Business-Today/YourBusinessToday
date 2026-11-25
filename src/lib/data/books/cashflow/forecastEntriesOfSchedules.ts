import { isoDateDaysFrom } from '$lib/data/demo/demoDates';
import { invoiceDateAfter } from '../billingPeriods';
import type { BillingScheduleSettings } from '../billingSchedule';
import { BillingScheduleStandings, nextScheduledInvoice, standingOfSchedule } from '../billingScheduleStanding';
import type { InvoiceLineInput } from '../invoiceLineRules';
import { monthOfDay, type MonthKey } from '../monthKey';
import { CashflowDirections } from './cashflowItem';
import type { ForecastEntry } from './cashflowForecast';

/** A billing schedule as the forecast reads it: its settings, its lines and the customer it bills, by name. */
export type ScheduleToForecast = BillingScheduleSettings & { lines: InvoiceLineInput[]; customerName: string };

/**
 * The money each running schedule brings in within the months given: every invoice it will raise, from its next invoice
 * date to its last date, counted in the month it falls due once the days to pay have passed. A paused schedule brings none.
 */
export function forecastEntriesOfSchedules(schedules: ScheduleToForecast[], months: MonthKey[], booksPaymentTermsDays: number): ForecastEntry[] {
	const lastMonth = months.at(-1) as MonthKey;
	return schedules
		.filter((schedule) => standingOfSchedule(schedule) === BillingScheduleStandings.running)
		.flatMap((schedule) => entriesOfSchedule(schedule, lastMonth, booksPaymentTermsDays))
		.filter((entry) => months.includes(entry.month));
}

function entriesOfSchedule(schedule: ScheduleToForecast, lastMonth: MonthKey, booksPaymentTermsDays: number): ForecastEntry[] {
	const { total } = nextScheduledInvoice(schedule);
	const daysToPay = schedule.paymentTermsDays ?? booksPaymentTermsDays;
	const source = `${schedule.customerName}: ${schedule.title}`;
	return invoiceDatesOf(schedule, lastMonth)
		.map((invoiceDate) => monthOfDay(isoDateDaysFrom(invoiceDate, daysToPay)))
		.map((month) => ({ month, source, direction: CashflowDirections.moneyIn, amount: total }));
}

function invoiceDatesOf(schedule: ScheduleToForecast, lastMonth: MonthKey): string[] {
	const dates: string[] = [];
	let invoiceDate = schedule.nextInvoiceDate;
	while (monthOfDay(invoiceDate) <= lastMonth && (schedule.endsOn === null || invoiceDate <= schedule.endsOn)) {
		dates.push(invoiceDate);
		invoiceDate = invoiceDateAfter(invoiceDate, schedule.frequency);
	}
	return dates;
}
