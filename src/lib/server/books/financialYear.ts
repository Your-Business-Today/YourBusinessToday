import type { SupabaseClient } from '@supabase/supabase-js';
import type { FinancialYear } from '$lib/data/books/financialYear';
import { booksSettingsTable } from '$lib/data/books/booksSettings';
import { isSchemaNotYetMigrated } from '$lib/server/schema/schemaNotYetMigrated';

/** The month a financial year starts in when the organisation has not saved its settings: the column's default. */
export const defaultFinancialYearStartMonth = 4;

type FinancialYearRow = { financial_year_start_month: number; first_period_start: string | null; first_period_end: string | null };

const startMonthColumn = 'financial_year_start_month';
const financialYearColumns = `${startMonthColumn}, first_period_start, first_period_end`;

/**
 * How the organisation's financial years run. Until migration 0218 has run the books know only the start month,
 * so they read as they did before it.
 */
export async function findFinancialYear(supabase: SupabaseClient, organisationId: string): Promise<FinancialYear> {
	const { data, error } = await settingsOf(supabase, organisationId, financialYearColumns);
	if (isSchemaNotYetMigrated(error)) return { startMonth: await findStartMonth(supabase, organisationId), firstPeriod: null };
	if (error !== null) throw error;
	return financialYearOf(data as FinancialYearRow | null);
}

async function findStartMonth(supabase: SupabaseClient, organisationId: string): Promise<number> {
	const { data, error } = await settingsOf(supabase, organisationId, startMonthColumn);
	if (error !== null) throw error;
	return (data as FinancialYearRow | null)?.financial_year_start_month ?? defaultFinancialYearStartMonth;
}

function settingsOf(supabase: SupabaseClient, organisationId: string, columns: string) {
	return supabase.from(booksSettingsTable).select(columns).eq('organisation_id', organisationId).maybeSingle();
}

function financialYearOf(row: FinancialYearRow | null): FinancialYear {
	if (row === null) return { startMonth: defaultFinancialYearStartMonth, firstPeriod: null };
	const { first_period_start: start, first_period_end: end } = row;
	const hasFirstPeriod = start !== null && end !== null;
	return { startMonth: row.financial_year_start_month, firstPeriod: hasFirstPeriod ? { start, end } : null };
}
