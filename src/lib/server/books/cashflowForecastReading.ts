import type { SupabaseClient } from '@supabase/supabase-js';
import { invoiceSettingDefaults } from '$lib/data/books/booksSettings';
import { buildCashflowForecast, forecastMonthsFrom, type CashflowForecast, type ForecastEntry } from '$lib/data/books/cashflow/cashflowForecast';
import type { CashflowItem } from '$lib/data/books/cashflow/cashflowItem';
import { forecastEntriesOfItems } from '$lib/data/books/cashflow/forecastEntriesOfItems';
import { forecastEntriesOfSchedules, type ScheduleToForecast } from '$lib/data/books/cashflow/forecastEntriesOfSchedules';
import { monthOfDay } from '$lib/data/books/monthKey';
import { findBillingSchedules } from './billingSchedules';
import { findBooksSettings } from './booksSettings';
import { cashAtBankOn } from './cashAtBank';
import { findCashflowItems } from './cashflowItems';
import { findCustomers } from './customers';
import { findLoanBudgets } from './loanBudgets';
import type { LoanBudget } from '$lib/data/books/loanBudget/loanBudget';
import { forecastEntriesOfLoanBudgets } from '$lib/data/books/loanBudget/forecastEntriesOfLoanBudgets';

/** The forecast as read on a day: the cash at bank it starts from, the months, every entry in them and the items kept. */
export type CashflowForecastReading = {
	asAt: string;
	forecast: CashflowForecast;
	entries: ForecastEntry[];
	items: CashflowItem[];
	loanBudgets: LoanBudget[];
};

const everyCustomer = { customerId: null };

/** Twelve months from the month of the day given: the cash at bank at the end of it, the items, the running schedules and the loans. */
export async function readCashflowForecast(supabase: SupabaseClient, organisationId: string, asAt: string): Promise<CashflowForecastReading> {
	const months = forecastMonthsFrom(monthOfDay(asAt));
	const [openingBalance, items, schedules, settings, loanBudgets] = await Promise.all([
		cashAtBankOn(supabase, organisationId, asAt),
		findCashflowItems(supabase, organisationId),
		findSchedulesToForecast(supabase, organisationId),
		findBooksSettings(supabase, organisationId),
		findLoanBudgets(supabase, organisationId)
	]);
	const paymentTermsDays = settings?.paymentTermsDays ?? invoiceSettingDefaults.paymentTermsDays;
	const entries = [
		...forecastEntriesOfItems(items, months),
		...forecastEntriesOfSchedules(schedules, months, paymentTermsDays),
		...forecastEntriesOfLoanBudgets(loanBudgets, months)
	];
	return { asAt, forecast: buildCashflowForecast(openingBalance, months, entries), entries, items, loanBudgets };
}

async function findSchedulesToForecast(supabase: SupabaseClient, organisationId: string): Promise<ScheduleToForecast[]> {
	const [schedules, customers] = await Promise.all([findBillingSchedules(supabase, organisationId, everyCustomer), findCustomers(supabase, organisationId)]);
	const customerNames = new Map(customers.map((customer) => [customer.id, customer.name]));
	return schedules.map((schedule) => ({ ...schedule, customerName: customerNames.get(schedule.customerId) ?? schedule.title }));
}
