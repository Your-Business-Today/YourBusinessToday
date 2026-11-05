import { getAccountsById } from '$lib/server/accounts/getAccountsById';
import { readEveryRow } from '$lib/server/schema/readEveryRow';
import { owingPersonOf, type OwingPerson } from './owingPerson';
import type { Account } from '$lib/server/accounts/accountRecord';
import type { SupabaseClient } from '@supabase/supabase-js';

/** Everyone on these projects, owners and members alike, but the one asking: the people who may owe them work. */
export async function getOtherPeopleOnProjects(
	supabase: SupabaseClient,
	projectIds: string[],
	askingAccountId: string
): Promise<{ people: OwingPerson[]; accounts: Account[] }> {
	if (projectIds.length === 0) return { people: [], accounts: [] };
	const [memberIds, ownerIds] = await Promise.all([
		readColumnValues(supabase, 'project_members', 'account_id', 'project_id', projectIds),
		readColumnValues(supabase, 'projects', 'owner_id', 'id', projectIds)
	]);
	const otherIds = [...memberIds, ...ownerIds].filter((accountId) => accountId !== askingAccountId);
	const accounts = await getAccountsById(supabase, otherIds);
	return { people: accounts.map(owingPersonOf), accounts };
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
