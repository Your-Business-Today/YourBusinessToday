import { agendaKey, agendaKindOrder, agendaKinds, type AgendaItem } from './agendaItem';
import { longTermGoalHorizon } from '$lib/data/goalHorizon';

const undatedLast = '\uffff';

/** What narrows a conversation: one project, or bugs alone. */
export type AgendaFocus = { projectId: string | null; isBugsOnly: boolean };

/**
 * The agenda in the order the agent raises it: every bug first, then each kind in its turn, the
 * longest waiting first within a kind, and the key last so the same board always gives the same order.
 * Only current work is raised: work on a long term goal waits until someone makes that goal current.
 * Items put off until a later day are left out, with the promises made on a task that was put off,
 * and so is anything outside the focus.
 */
export function orderAgenda(items: AgendaItem[], focus: AgendaFocus, snoozedKeys: Set<string>): AgendaItem[] {
	const raisable = items.filter((item) => isCurrentWork(item) && isInFocus(item, focus) && !isPutOff(item, snoozedKeys));
	return raisable.sort(byAgendaOrder);
}

function isCurrentWork(item: AgendaItem): boolean {
	const { goal } = item;
	if (goal === null) return true;
	return goal.horizon !== longTermGoalHorizon;
}

function isPutOff(item: AgendaItem, snoozedKeys: Set<string>): boolean {
	if (snoozedKeys.has(item.key)) return true;
	const { kind, subjectId } = item;
	const isPromise = kind === agendaKinds.promise && subjectId !== null;
	return isPromise && snoozedKeys.has(agendaKey('task', subjectId));
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
