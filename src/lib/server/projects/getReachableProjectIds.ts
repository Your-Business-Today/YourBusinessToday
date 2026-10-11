import type { SupabaseClient } from '@supabase/supabase-js';
import { getMemberProjectIds } from '$lib/server/members/getMemberProjectIds';
import { getOwnedProjectIds } from '$lib/server/projects/getOwnedProjectIds';

/** Every project the account can reach: the ones it owns and the ones it is on. */
export async function getReachableProjectIds(
	supabase: SupabaseClient,
	accountId: string
): Promise<string[]> {
	const [owned, member] = await Promise.all([
		getOwnedProjectIds(supabase, accountId),
		getMemberProjectIds(supabase, accountId)
	]);
	return [...new Set([...owned, ...member])];
}
