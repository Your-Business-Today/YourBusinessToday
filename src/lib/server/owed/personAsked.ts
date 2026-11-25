import { getOtherPeopleOnProjects } from './peopleOnProjects';
import { getOwingPerson, owingPersonOf, type OwingPerson } from './owingPerson';
import { getAccountsById } from '$lib/server/accounts/getAccountsById';
import type { Account } from '$lib/server/accounts/accountRecord';
import type { SupabaseClient } from '@supabase/supabase-js';

/** The person a question is about: the one asking, or someone they share a project with. */
export type PersonAsked = { person: OwingPerson; account: Account; isCaller: boolean };

/** Who was asked about, or every person it could be when the words fit none or several. */
export type PersonLookup = { found: PersonAsked | null; candidates: Account[] };

type Asking = { supabase: SupabaseClient; callerId: string; projectIds: string[]; words: string | null };

/** Finds the person asked about by account id, email or name among everyone on the caller's projects. */
export async function findPersonAsked(asking: Asking): Promise<PersonLookup> {
	const { supabase, callerId, projectIds, words } = asking;
	const caller = await getOwingPerson(supabase, callerId, null);
	const [callerAccount] = await getAccountsById(supabase, [caller.accountId]);
	const { people: others, accounts } = await getOtherPeopleOnProjects(supabase, projectIds, caller.accountIds);
	const everyone = [caller, ...others];
	const everyAccount = [callerAccount ?? { id: caller.accountId, name: '', email: '' }, ...accounts];
	const personOf = (account: Account) => everyone.find((person) => person.accountId === account.id) ?? owingPersonOf(account, [account.id]);
	const foundOf = (account: Account) => ({ person: personOf(account), account, isCaller: account.id === caller.accountId });
	if (words === null || caller.accountIds.includes(words)) return { found: foundOf(everyAccount[0]), candidates: [] };
	const matches = everyAccount.filter((account) => isNamedBy(account, personOf(account).titleName, words));
	if (matches.length === 1) return { found: foundOf(matches[0]), candidates: [] };
	return { found: null, candidates: matches.length === 0 ? everyAccount : matches };
}

const nameSeparators = /[\s@.]+/;

function isNamedBy(account: Account, titleName: string | null, words: string): boolean {
	const asked = words.trim().toLowerCase();
	const isWholeMatch = [account.id, account.email, account.name, titleName ?? ''].some((known) => known.toLowerCase() === asked);
	if (isWholeMatch) return true;
	const nameWords = `${account.name} ${account.email}`.toLowerCase().split(nameSeparators);
	return nameWords.some((nameWord) => nameWord.startsWith(asked));
}
