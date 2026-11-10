import type { SupabaseClient } from '@supabase/supabase-js';

/** The month a financial year starts in when the organisation has not saved its settings: the column's default. */
export const defaultFinancialYearStartMonth = 4;

/** The month (1 to 12) the organisation's financial year starts in. */
export async function findFinancialYearStartMonth(supabase: SupabaseClient, organisationId: string): Promise<number> {
	const { data, error } = await supabase
		.from('books_settings')
		.select('financial_year_start_month')
		.eq('organisation_id', organisationId)
		.maybeSingle();
	if (error !== null) throw error;
	return data?.financial_year_start_month ?? defaultFinancialYearStartMonth;
}
