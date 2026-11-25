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

/** The forecast as read on a day: the cash at bank it starts from, the months, every entry in them and the items kept. */
export type CashflowForecastReading = { asAt: string; forecast: CashflowForecast; entries: ForecastEntry[]; items: CashflowItem[] };

const everyCustomer = { customerId: null };

/** Twelve months from the month of the day given: the cash at bank at the end of it, the items kept and the running schedules. */
export async function readCashflowForecast(supabase: SupabaseClient, organisationId: string, asAt: string): Promise<CashflowForecastReading> {
	const months = forecastMonthsFrom(monthOfDay(asAt));
	const [openingBalance, items, schedules, settings] = await Promise.all([
		cashAtBankOn(supabase, organisationId, asAt),
		findCashflowItems(supabase, organisationId),
		findSchedulesToForecast(supabase, organisationId),
		findBooksSettings(supabase, organisationId)
	]);
	const paymentTermsDays = settings?.paymentTermsDays ?? invoiceSettingDefaults.paymentTermsDays;
	const entries = [...forecastEntriesOfItems(items, months), ...forecastEntriesOfSchedules(schedules, months, paymentTermsDays)];
	return { asAt, forecast: buildCashflowForecast(openingBalance, months, entries), entries, items };
}

async function findSchedulesToForecast(supabase: SupabaseClient, organisationId: string): Promise<ScheduleToForecast[]> {
	const [schedules, customers] = await Promise.all([findBillingSchedules(supabase, organisationId, everyCustomer), findCustomers(supabase, organisationId)]);
	const customerNames = new Map(customers.map((customer) => [customer.id, customer.name]));
	return schedules.map((schedule) => ({ ...schedule, customerName: customerNames.get(schedule.customerId) ?? schedule.title }));
}
