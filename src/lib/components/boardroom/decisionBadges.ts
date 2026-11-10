import { decisionAnswers, type DecisionAnswerKind } from '$lib/data/boardroomDecision';
import { decisionStandings, type DecisionStanding } from '$lib/data/boardDecisionViews';
import type { BadgeTone } from '$lib/components/site/badgeTones';

/** The badge a decision or a director's answer to it carries on the meeting's page. */
export type DecisionBadge = { label: string; tone: BadgeTone };

export const decisionStandingBadges: Record<DecisionStanding, DecisionBadge> = {
	[decisionStandings.waiting]: { label: 'Waiting for the directors', tone: 'progress' },
	[decisionStandings.carried]: { label: 'Carried', tone: 'positive' },
	[decisionStandings.notCarried]: { label: 'Not carried', tone: 'negative' }
};

export const decisionAnswerBadges: Record<DecisionAnswerKind, DecisionBadge> = {
	[decisionAnswers.agrees]: { label: 'Agrees', tone: 'positive' },
	[decisionAnswers.disagrees]: { label: 'Disagrees', tone: 'negative' },
	[decisionAnswers.abstains]: { label: 'Abstains', tone: 'neutral' }
};
