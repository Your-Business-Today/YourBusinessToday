import { getAccountsById } from '$lib/server/accounts/getAccountsById';
import { nameUsedInTitles } from '$lib/data/personNamedInTitle';
import type { Account } from '$lib/server/accounts/accountRecord';
import type { SupabaseClient } from '@supabase/supabase-js';

/** Someone who may owe work: their account, and the first name people write for them in task titles. */
export type OwingPerson = { accountId: string; titleName: string | null };

export function owingPersonOf(account: Account): OwingPerson {
	return { accountId: account.id, titleName: nameUsedInTitles(account.name, account.email) };
}

/** The person behind an account, named as given or by the first word of their account name. */
export async function getOwingPerson(
	supabase: SupabaseClient,
	accountId: string,
	givenTitleName: string | null
): Promise<OwingPerson> {
	if (givenTitleName !== null) return { accountId, titleName: givenTitleName };
	const [account] = await getAccountsById(supabase, [accountId]);
	if (account === undefined) return { accountId, titleName: null };
	return owingPersonOf(account);
}
