import { actionStandingKinds, type ActionStandingKind } from '$lib/data/boardActionStanding';
import type { DecisionBadge } from './decisionBadges';

/** The badge an action carries on the meeting's page: waiting on its decision, raised, or not. */
export const actionStandingBadges: Record<ActionStandingKind, DecisionBadge> = {
	[actionStandingKinds.awaitingDecision]: { label: 'Waits for the decision', tone: 'progress' },
	[actionStandingKinds.notCarried]: { label: 'Not raised', tone: 'neutral' },
	[actionStandingKinds.toRaise]: { label: 'Not raised yet', tone: 'warning' },
	[actionStandingKinds.raised]: { label: 'Raised', tone: 'positive' },
	[actionStandingKinds.notOnBoard]: { label: 'Not on its board', tone: 'negative' }
};
