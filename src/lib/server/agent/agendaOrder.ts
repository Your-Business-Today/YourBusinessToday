import { agendaKey, agendaKindOrder, agendaKinds, owedKinds, quickAnswerKinds, type AgendaItem } from './agendaItem';
import { byBlendedScore } from './blendedScore';
import { longTermGoalHorizon } from '$lib/data/goalHorizon';

const undatedLast = '￿';
const focusProjectCount = 3;

/** What narrows a conversation: one project, or bugs alone. */
export type AgendaFocus = { projectId: string | null; isBugsOnly: boolean };

/**
 * The agenda in the order the agent raises it. What the person owes themselves (their asks, jobs,
 * promises and to-dos) is raised on every project they are on, whatever its status; the rest (work to
 * build, people to chase, long term goals) only on their active projects, and of those only the first
 * three, in their own order, that have any; work on no project stays. Only current work. Within that: every bug first, then the quick answers, then the rest by priority and size
 * blended, and a long term goal to make current last of all. Items put off until a later day are left
 * out, with the promises made on a task that was put off, and so is anything outside the focus.
 */
export function orderAgenda(
	items: AgendaItem[],
	focus: AgendaFocus,
	snoozedKeys: Set<string>,
	activeProjectIds: string[]
): AgendaItem[] {
	const raisable = items.filter(
		(item) => isOnProjects(item, activeProjectIds) && isCurrentWork(item) && isInFocus(item, focus) && !isPutOff(item, snoozedKeys)
	);
	const focused = focus.projectId === null ? onTheFirstProjects(raisable, activeProjectIds) : raisable;
	return focused.sort(byAgendaOrder);
}

function onTheFirstProjects(items: AgendaItem[], activeProjectIds: string[]): AgendaItem[] {
	const boardWork = items.filter((item) => !isOwed(item));
	const projectsWithWork = activeProjectIds.filter((projectId) => boardWork.some((item) => item.projectId === projectId));
	const firstProjects = projectsWithWork.slice(0, focusProjectCount);
	return items.filter((item) => isOnProjects(item, firstProjects));
}

function isOnProjects(item: AgendaItem, projectIds: string[]): boolean {
	if (isOwed(item) || item.projectId === null) return true;
	return projectIds.includes(item.projectId);
}

function isOwed(item: AgendaItem): boolean {
	return owedKinds.includes(item.kind);
}

function isCurrentWork(item: AgendaItem): boolean {
	if (item.kind === agendaKinds.goal) return true;
	const { goal } = item;
	return goal?.horizon !== longTermGoalHorizon;
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
	const goalLast = Number(left.kind === agendaKinds.goal) - Number(right.kind === agendaKinds.goal);
	if (goalLast !== 0) return goalLast;
	const bugFirst = Number(right.isBug) - Number(left.isBug);
	if (bugFirst !== 0) return bugFirst;
	const quickFirst = Number(isQuickAnswer(right)) - Number(isQuickAnswer(left));
	if (quickFirst !== 0) return quickFirst;
	const blended = byBlendedScore(left, right);
	if (blended !== 0) return blended;
	const kindFirst = agendaKindOrder.indexOf(left.kind) - agendaKindOrder.indexOf(right.kind);
	if (kindFirst !== 0) return kindFirst;
	const oldestFirst = (left.since ?? undatedLast).localeCompare(right.since ?? undatedLast);
	if (oldestFirst !== 0) return oldestFirst;
	return left.key.localeCompare(right.key);
}

function isQuickAnswer(item: AgendaItem): boolean {
	return quickAnswerKinds.includes(item.kind);
}
