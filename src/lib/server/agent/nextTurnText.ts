import { accountNameLookup } from '$lib/data/accountNames';
import { buildAgenda } from './buildAgenda';
import { describeTurn } from './describeTurn';
import { getAccountsById } from '$lib/server/accounts/getAccountsById';
import type { AgendaFocus } from './agendaOrder';
import type { McpCaller } from '$lib/server/mcp/resolveMcpCaller';

/** The turn to put to the person now, worked out fresh from the board. */
export async function nextTurnText(caller: McpCaller, focus: AgendaFocus, now: Date): Promise<string> {
	const agenda = await buildAgenda(caller, focus, now);
	const askerIds = agenda.items.flatMap((item) => item.askedById ?? []);
	const nameOf = accountNameLookup(await getAccountsById(caller.supabase, askerIds));
	return describeTurn({ agenda, nameOf, now }).join('\n');
}
