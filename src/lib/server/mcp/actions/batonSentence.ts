import { accountNameLookup } from '$lib/data/accountNames';
import { getAccountDirectory } from '$lib/server/accounts/getAccountDirectory';
import type { HandOff } from '$lib/data/conversationTurn';
import type { McpCaller } from '../resolveMcpCaller';

export async function batonSentence(caller: McpCaller, handOff: HandOff | null): Promise<string> {
	if (handOff === null) return 'Nobody is waiting on anything now.';
	const accounts = await getAccountDirectory(caller.supabase, [handOff.accountId]);
	const name = accountNameLookup(accounts)(handOff.accountId);
	if (handOff.kind === 'claude') return `The baton is with ${name}’s Claude to answer.`;
	return `The baton is with ${name}: their Claude will bring it to them.`;
}
