import { agendaFromChase } from './agendaFromChase';
import { agendaFromOwes } from './agendaFromOwes';
import { buildItems, longTermGoalItems } from './boardItems';
import { getActiveProjectIds } from './activeProjects';
import { getChaseList } from '$lib/server/mcp/actions/chaseList';
import { getConversationRecord, type ConversationRecord } from './conversationRecord';
import { getWhatCallerOwes } from '$lib/server/owed/callerOwes';
import { boardOnProjects, loadAgendaBoard } from './agendaBoard';
import { orderAgenda, type AgendaFocus } from './agendaOrder';
import { placeOnBoard } from './boardPlacement';
import { withoutWaitingWork } from './waitingWork';
import { dayOf } from '$lib/data/days';
import type { AgendaItem } from './agendaItem';
import type { McpCaller } from '$lib/server/mcp/resolveMcpCaller';

/** A person's agenda as it stands now, in the order the agent raises it, with where their conversation stands. */
export type Agenda = { items: AgendaItem[]; record: ConversationRecord };

/**
 * Worked out fresh from the board on every turn, so the same board always gives the same next item,
 * however and wherever the conversation starts. What the person owes, on every project they are on;
 * who they chase, the work that can be built now and, once nothing current is open, the long term
 * goals to make current, on their active projects; all placed on their goals and tasks so the order
 * can weigh them. Work that
 * waits on someone else, directly or through a task it follows, is left out.
 */
export async function buildAgenda(caller: McpCaller, focus: AgendaFocus, now: Date): Promise<Agenda> {
	const owes = await getWhatCallerOwes(caller, null);
	const { person } = owes;
	const { ownedProjectIds } = caller;
	const isManager = ownedProjectIds.length > 0;
	const [chase, record, activeProjectIds] = await Promise.all([
		isManager ? getChaseList(caller, false) : null,
		getConversationRecord(caller.supabase, person.accountIds, dayOf(now.getTime())),
		getActiveProjectIds(caller.supabase, caller.accountId)
	]);
	const owedItems = agendaFromOwes(owes);
	const board = await loadAgendaBoard(caller.supabase, projectIdsToLoad(activeProjectIds, owedItems));
	const activeBoard = boardOnProjects(board, activeProjectIds);
	const chaseItems = chase === null ? [] : agendaFromChase(chase);
	const placed = placeOnBoard([...owedItems, ...chaseItems], board);
	const everything = [...placed, ...buildItems(activeBoard), ...longTermGoalItems(activeBoard)];
	const yours = await withoutWaitingWork(caller.supabase, everything, board, person.accountIds);
	const items = orderAgenda(yours, focus, record.snoozedKeys, activeProjectIds);
	return { items, record };
}

/** The active projects, and every other project the person owes something on. */
function projectIdsToLoad(activeProjectIds: string[], owedItems: AgendaItem[]): string[] {
	const owedProjectIds = owedItems.flatMap((item) => item.projectId ?? []);
	return [...new Set([...activeProjectIds, ...owedProjectIds])];
}
