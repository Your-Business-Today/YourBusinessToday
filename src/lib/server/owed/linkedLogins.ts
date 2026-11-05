import { isSchemaNotYetMigrated } from '$lib/server/schema/schemaNotYetMigrated';
import type { SupabaseClient } from '@supabase/supabase-js';

/** One person's logins: the main one, then every other login linked to it. */
export type PersonLogins = { personAccountId: string; accountIds: string[] };

type LinkRow = { account_id: string; person_account_id: string };

/** Every login of the person behind each of these accounts, keyed by each account asked about. */
export async function getLoginsOfPeople(
	supabase: SupabaseClient,
	accountIds: string[]
): Promise<Map<string, PersonLogins>> {
	const ownLinks = await readLinks(supabase, 'account_id', accountIds);
	const mainIdByLogin = new Map(ownLinks.map((link) => [link.account_id, link.person_account_id]));
	const mainIdOf = (accountId: string) => mainIdByLogin.get(accountId) ?? accountId;
	const mainIds = [...new Set(accountIds.map(mainIdOf))];
	const linksToMains = await readLinks(supabase, 'person_account_id', mainIds);
	const loginsOf = (mainId: string): PersonLogins => {
		const others = linksToMains.filter((link) => link.person_account_id === mainId).map((link) => link.account_id);
		return { personAccountId: mainId, accountIds: [mainId, ...others] };
	};
	return new Map(accountIds.map((accountId) => [accountId, loginsOf(mainIdOf(accountId))]));
}

async function readLinks(supabase: SupabaseClient, column: string, ids: string[]): Promise<LinkRow[]> {
	if (ids.length === 0) return [];
	const { data, error } = await supabase.from('linked_logins').select('account_id, person_account_id').in(column, ids);
	if (isSchemaNotYetMigrated(error)) return [];
	if (error) throw error;
	return (data ?? []) as LinkRow[];
}

/** Records that a login is one more way in for the person whose main login is given. */
export async function linkLogin(supabase: SupabaseClient, accountId: string, personAccountId: string, linkedBy: string): Promise<void> {
	const link = { account_id: accountId, person_account_id: personAccountId, linked_by: linkedBy };
	const { error } = await supabase.from('linked_logins').upsert(link, { onConflict: 'account_id' });
	if (error) throw error;
}

/** Makes a login stand on its own again. */
export async function unlinkLogin(supabase: SupabaseClient, accountId: string): Promise<void> {
	const { error } = await supabase.from('linked_logins').delete().eq('account_id', accountId);
	if (error) throw error;
}
