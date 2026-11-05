import { agendaFromChase } from './agendaFromChase';
import { agendaFromOwes } from './agendaFromOwes';
import { getChaseList } from '$lib/server/mcp/actions/chaseList';
import { getConversationRecord, type ConversationRecord } from './conversationRecord';
import { getWhatCallerOwes } from '$lib/server/owed/callerOwes';
import { orderAgenda, type AgendaFocus } from './agendaOrder';
import { dayOf } from '$lib/data/days';
import type { AgendaItem } from './agendaItem';
import type { McpCaller } from '$lib/server/mcp/resolveMcpCaller';

/** A person's agenda as it stands now, in the order the agent raises it, with where their conversation stands. */
export type Agenda = { items: AgendaItem[]; record: ConversationRecord };

/**
 * Worked out fresh from the board on every turn, so the same board always gives the same next item,
 * however and wherever the conversation starts. Who to chase joins it for anyone who owns a project.
 */
export async function buildAgenda(caller: McpCaller, focus: AgendaFocus, now: Date): Promise<Agenda> {
	const owes = await getWhatCallerOwes(caller, null);
	const { person } = owes;
	const { ownedProjectIds } = caller;
	const isManager = ownedProjectIds.length > 0;
	const [chase, record] = await Promise.all([
		isManager ? getChaseList(caller, false) : null,
		getConversationRecord(caller.supabase, person.accountIds, dayOf(now.getTime()))
	]);
	const chaseItems = chase === null ? [] : agendaFromChase(chase);
	const items = orderAgenda([...agendaFromOwes(owes), ...chaseItems], focus, record.snoozedKeys);
	return { items, record };
}
