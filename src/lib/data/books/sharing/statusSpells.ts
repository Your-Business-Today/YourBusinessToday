import type { MonthKey } from '../monthKey';
import type { CostShareMember } from './costShare';
import { liveProjectStatuses } from './costShareMembersBy';

/** One change of a project's status, in the UK month it happened; a starting status stands for every month before the history began. */
export type ProjectStatusChange = { status: string; changedMonth: MonthKey; isStartingStatus: boolean };

type Spell = Pick<CostShareMember, 'joinedMonth' | 'leftMonth'>;

/** The month a starting status is read back to: earlier than any line the books keep. */
export const beforeTheHistoryBegan: MonthKey = '2000-01';

/**
 * The spells a project is live, from its status changes in the order they happened: live in a month when it was
 * building, testing or in maintenance at any time that month, so it shares the month it is put on hold and leaves after.
 */
export function liveSpellsOf(changes: ProjectStatusChange[]): Spell[] {
	const spans = changes.map((change, index) => ({ change, spell: spanOf(changes, index) }));
	const liveSpans = spans.filter(({ change }) => liveProjectStatuses.some((status) => status === change.status));
	return liveSpans.map(({ spell }) => spell).reduce(joinOverlapping, []);
}

/** A member for every live spell of every project, so a shared cost kept by rule splits as one with named members does. */
export function membersByStatus(histories: Map<string, ProjectStatusChange[]>): CostShareMember[] {
	return [...histories].flatMap(([projectId, changes]) =>
		liveSpellsOf(changes).map((spell, index) => ({ id: `status-${projectId}-${index}`, projectId, ...spell }))
	);
}

function spanOf(changes: ProjectStatusChange[], index: number): Spell {
	const change = changes[index];
	const isReadBack = index === 0 && change.isStartingStatus;
	const next = changes.at(index + 1);
	return { joinedMonth: isReadBack ? beforeTheHistoryBegan : change.changedMonth, leftMonth: next?.changedMonth ?? null };
}

function joinOverlapping(spells: Spell[], spell: Spell): Spell[] {
	const last = spells.at(-1);
	const isOverlapping = last !== undefined && last.leftMonth !== null && spell.joinedMonth <= last.leftMonth;
	if (!isOverlapping) return [...spells, spell];
	return [...spells.slice(0, -1), { joinedMonth: last.joinedMonth, leftMonth: spell.leftMonth }];
}
