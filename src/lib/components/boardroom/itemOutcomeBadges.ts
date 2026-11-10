import { outcomeKinds, type OutcomeKind } from '$lib/data/boardroomRoom';
import type { BadgeTone } from '$lib/components/site/badgeTones';

/** The badge an item carries once it has come out of the room. */
export type OutcomeBadge = { label: string; tone: BadgeTone };

const outcomeBadges: Record<OutcomeKind, OutcomeBadge> = {
	[outcomeKinds.agreed]: { label: 'Agreed', tone: 'positive' },
	[outcomeKinds.notAgreed]: { label: 'Not agreed', tone: 'warning' }
};

export function outcomeBadgeOf(outcome: OutcomeKind | null): OutcomeBadge | null {
	if (outcome === null) return null;
	return outcomeBadges[outcome];
}
