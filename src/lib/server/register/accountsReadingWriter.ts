import type { SupabaseClient } from '@supabase/supabase-js';
import { accountsReadingColumns, accountsReadingRowOf, parseAccountsReading } from './accountsReadingRecord';
import { validateAccountsReading, type AccountsReading } from '$lib/data/accountsReadingRules';

const readingsTable = 'company_accounts_readings';

export async function getAccountsReading(supabase: SupabaseClient, companyNumber: string): Promise<AccountsReading | null> {
	const { data, error } = await supabase.from(readingsTable).select(accountsReadingColumns).eq('company_number', companyNumber).maybeSingle();
	if (error) throw error;
	return data === null ? null : parseAccountsReading(data);
}

/** The one door every reading is written by: checked against its columns first, and a misread refused with its reason. */
export async function saveAccountsReading(supabase: SupabaseClient, reading: AccountsReading): Promise<string | null> {
	const refusal = validateAccountsReading(reading);
	if (refusal !== null) return refusal;
	const { error } = await supabase.from(readingsTable).upsert(accountsReadingRowOf(reading), { onConflict: 'company_number' });
	if (error) throw error;
	return null;
}
