import { getAccountsById } from '$lib/server/accounts/getAccountsById';
import { getLoginsOfPeople } from './linkedLogins';
import { nameUsedInTitles } from '$lib/data/personNamedInTitle';
import type { Account } from '$lib/server/accounts/accountRecord';
import type { SupabaseClient } from '@supabase/supabase-js';

/**
 * Someone who may owe work: their main login, every login of theirs (the main one first), and the
 * first name people write for them in task titles.
 */
export type OwingPerson = { accountId: string; accountIds: string[]; titleName: string | null };

export function owingPersonOf(account: Account, accountIds: string[]): OwingPerson {
	return { accountId: account.id, accountIds, titleName: nameUsedInTitles(account.name, account.email) };
}

/** The person behind an account, with all their logins, named as given or by the first word of their main login's name. */
export async function getOwingPerson(
	supabase: SupabaseClient,
	accountId: string,
	givenTitleName: string | null
): Promise<OwingPerson> {
	const loginsByAccount = await getLoginsOfPeople(supabase, [accountId]);
	const logins = loginsByAccount.get(accountId) ?? { personAccountId: accountId, accountIds: [accountId] };
	const { personAccountId, accountIds } = logins;
	const [account] = await getAccountsById(supabase, [personAccountId]);
	const titleName = givenTitleName ?? titleNameOf(account);
	return { accountId: personAccountId, accountIds, titleName };
}

function titleNameOf(account: Account | undefined): string | null {
	if (account === undefined) return null;
	return nameUsedInTitles(account.name, account.email);
}
