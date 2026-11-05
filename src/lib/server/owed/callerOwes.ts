import { getOwingPerson } from './owingPerson';
import { getWhatPersonOwes, type WhatPersonOwes } from './whatPersonOwes';
import { reachableProjectIds } from '$lib/server/mcp/projectAccess';
import type { McpCaller } from '$lib/server/mcp/resolveMcpCaller';

/** What the signed-in person owes on every project they can reach, named in titles as given or by their account. */
export async function getWhatCallerOwes(caller: McpCaller, givenTitleName: string | null): Promise<WhatPersonOwes> {
	const person = await getOwingPerson(caller.supabase, caller.accountId, givenTitleName);
	return getWhatPersonOwes(caller.supabase, person, reachableProjectIds(caller));
}
