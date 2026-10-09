import { accountNameLookup } from '$lib/data/accountNames';
import { getAccountsById } from '$lib/server/accounts/getAccountsById';
import { awaitingKinds, type HandOff } from '$lib/data/conversationTurn';
import type { McpCaller } from '../resolveMcpCaller';

export async function batonSentence(caller: McpCaller, handOff: HandOff | null): Promise<string> {
	if (handOff === null) return 'Nobody is waiting on anything now.';
	const accounts = await getAccountsById(caller.supabase, [handOff.accountId]);
	const name = accountNameLookup(accounts)(handOff.accountId);
	if (handOff.kind === awaitingKinds.claude) return `The baton is with ${name}’s Claude to answer.`;
	return `The baton is with ${name}: their Claude will bring it to them.`;
}
