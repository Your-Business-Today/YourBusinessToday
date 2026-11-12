import type { SupabaseClient } from '@supabase/supabase-js';
import { accountOnRegisterColumns, parseAccountOnRegister, type AccountOnRegister } from './accountOnRegister';
import { findAccountByEmail } from '$lib/server/accounts/findAccountByEmail';

/** The account with that email address and its standing, or null when nobody has it. */
export async function findAccountStanding(supabase: SupabaseClient, email: string): Promise<AccountOnRegister | null> {
	const account = await findAccountByEmail(supabase, email);
	if (account === null) return null;
	const { data, error } = await supabase.from('profiles').select(accountOnRegisterColumns).eq('id', account.id).maybeSingle();
	if (error) throw error;
	if (data === null) return null;
	return parseAccountOnRegister(data);
}
