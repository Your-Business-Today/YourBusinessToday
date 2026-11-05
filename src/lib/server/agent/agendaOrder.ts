import { agendaKindOrder, type AgendaItem } from './agendaItem';

const undatedLast = '\uffff';

/** What narrows a conversation: one project, or bugs alone. */
export type AgendaFocus = { projectId: string | null; isBugsOnly: boolean };

/**
 * The agenda in the order the agent raises it: every bug first, then each kind in its turn, the
 * longest waiting first within a kind, and the key last so the same board always gives the same order.
 * Items put off until a later day are left out, and so is anything outside the focus.
 */
export function orderAgenda(items: AgendaItem[], focus: AgendaFocus, snoozedKeys: Set<string>): AgendaItem[] {
	const inFocus = items.filter((item) => isInFocus(item, focus) && !snoozedKeys.has(item.key));
	return [...inFocus].sort(byAgendaOrder);
}

function isInFocus(item: AgendaItem, focus: AgendaFocus): boolean {
	if (focus.isBugsOnly && !item.isBug) return false;
	if (focus.projectId === null) return true;
	return item.projectId === focus.projectId;
}

function byAgendaOrder(left: AgendaItem, right: AgendaItem): number {
	const bugFirst = Number(right.isBug) - Number(left.isBug);
	if (bugFirst !== 0) return bugFirst;
	const kindFirst = agendaKindOrder.indexOf(left.kind) - agendaKindOrder.indexOf(right.kind);
	if (kindFirst !== 0) return kindFirst;
	const oldestFirst = (left.since ?? undatedLast).localeCompare(right.since ?? undatedLast);
	if (oldestFirst !== 0) return oldestFirst;
	return left.key.localeCompare(right.key);
}
