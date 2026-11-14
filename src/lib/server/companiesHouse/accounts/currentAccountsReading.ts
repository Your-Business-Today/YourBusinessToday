import type { SupabaseClient } from '@supabase/supabase-js';
import { getAccountsReading, saveAccountsReading } from '$lib/server/register/accountsReadingWriter';
import { readLatestAccounts } from './readLatestAccounts';
import type { AccountsReading } from '$lib/data/accountsReadingRules';

/** A company's reading as it stands now: the stored one while no newer accounts are filed, else read again and kept. A misread is the refusal. */
export async function currentAccountsReading(supabase: SupabaseClient, companyNumber: string): Promise<AccountsReading | string> {
	const stored = await getAccountsReading(supabase, companyNumber);
	const reading = await readLatestAccounts(companyNumber, stored);
	const isUnchanged = reading === stored;
	if (isUnchanged) return reading;
	const refusal = await saveAccountsReading(supabase, reading);
	return refusal ?? reading;
}
