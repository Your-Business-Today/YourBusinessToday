import { getAccountsById } from '$lib/server/accounts/getAccountsById';
import { getLoginsOfPeople, type PersonLogins } from './linkedLogins';
import { owingPersonOf, type OwingPerson } from './owingPerson';
import { readEveryRow } from '$lib/server/schema/readEveryRow';
import type { Account } from '$lib/server/accounts/accountRecord';
import type { SupabaseClient } from '@supabase/supabase-js';

/**
 * Everyone on these projects, owners and members alike, but the one asking: the people who may owe
 * them work. A person with several logins is listed once, by their main login.
 */
export async function getOtherPeopleOnProjects(
	supabase: SupabaseClient,
	projectIds: string[],
	askingAccountIds: string[]
): Promise<{ people: OwingPerson[]; accounts: Account[] }> {
	if (projectIds.length === 0) return { people: [], accounts: [] };
	const [memberIds, ownerIds] = await Promise.all([
		readColumnValues(supabase, 'project_members', 'account_id', 'project_id', projectIds),
		readColumnValues(supabase, 'projects', 'owner_id', 'id', projectIds)
	]);
	const loginsByAccount = await getLoginsOfPeople(supabase, [...new Set([...memberIds, ...ownerIds])]);
	const everyone = distinctPeople([...loginsByAccount.values()]);
	const others = everyone.filter((logins) => !logins.accountIds.some((accountId) => askingAccountIds.includes(accountId)));
	const accounts = await getAccountsById(supabase, others.map((logins) => logins.personAccountId));
	const loginsByPerson = new Map(others.map((logins) => [logins.personAccountId, logins.accountIds]));
	const people = accounts.map((account) => owingPersonOf(account, loginsByPerson.get(account.id) ?? [account.id]));
	return { people, accounts };
}

function distinctPeople(everyLogins: PersonLogins[]): PersonLogins[] {
	const byPerson = new Map(everyLogins.map((logins) => [logins.personAccountId, logins]));
	return [...byPerson.values()];
}

async function readColumnValues(
	supabase: SupabaseClient,
	table: string,
	accountColumn: string,
	projectColumn: string,
	projectIds: string[]
): Promise<string[]> {
	const rows = await readEveryRow((firstRow, lastRow) =>
		supabase.from(table).select(accountColumn).in(projectColumn, projectIds).range(firstRow, lastRow)
	);
	return rows.flatMap((row) => (row[accountColumn] as string | null) ?? []);
}
