/** A director's own answer to a decision put to them. */
export type DecisionAnswerKind = 'agrees' | 'disagrees' | 'abstains';

export const decisionAnswers = { agrees: 'agrees', disagrees: 'disagrees', abstains: 'abstains' } as const;

export const allDecisionAnswers: DecisionAnswerKind[] = [decisionAnswers.agrees, decisionAnswers.disagrees, decisionAnswers.abstains];

/** What carries a decision: more of the directors taking part for it than against, or every one of them. */
export type DecisionAgreement = 'majority' | 'unanimous';

export const decisionAgreements = { majority: 'majority', unanimous: 'unanimous' } as const;

export const allDecisionAgreements: DecisionAgreement[] = [decisionAgreements.majority, decisionAgreements.unanimous];

export type DecisionRuleSource = 'model_articles' | 'own_articles';

export const decisionRuleSources = { modelArticles: 'model_articles', ownArticles: 'own_articles' } as const;

/** How a decision of the directors carries, as the company's articles say. */
export type DecisionRule = {
	source: DecisionRuleSource;
	quorum: number;
	agreement: DecisionAgreement;
	hasChairCastingVote: boolean;
	articlesReference: string | null;
};

/**
 * The model articles for private companies limited by shares: a majority of the directors taking part, at least
 * two taking part (articles 7 and 11), and the chair's casting vote when the votes are equal (article 13).
 */
export const modelArticlesRule: DecisionRule = {
	source: decisionRuleSources.modelArticles,
	quorum: 2,
	agreement: decisionAgreements.majority,
	hasChairCastingVote: true,
	articlesReference: null
};

/** An item for decision that came out of the room agreed, put to the directors with the rule it is decided by. */
export type BoardDecision = {
	id: string;
	agendaItemId: string;
	meetingId: string;
	proposalId: string;
	wording: string;
	chairDirectorId: string;
	rule: DecisionRule;
	replacesDecisionId: string | null;
	openedAt: string;
};

/** One director's own answer to a decision, kept as they gave it. */
export type DecisionAnswer = {
	decisionId: string;
	directorId: string;
	answer: DecisionAnswerKind;
	reason: string | null;
	answeredAt: string;
};

/** A meeting's decisions, every answer to them, and the rule a decision put now is decided by. */
export type MeetingDecisions = {
	decisions: BoardDecision[];
	answers: DecisionAnswer[];
	ruleInForce: DecisionRule;
};

export const noMeetingDecisions: MeetingDecisions = { decisions: [], answers: [], ruleInForce: modelArticlesRule };

export function decisionOfItem(meetingDecisions: MeetingDecisions, agendaItemId: string): BoardDecision | null {
	return meetingDecisions.decisions.find((decision) => decision.agendaItemId === agendaItemId) ?? null;
}

/** Every answer given to one decision, in the order they were given. */
export function answersTo(meetingDecisions: MeetingDecisions, decisionId: string): DecisionAnswer[] {
	const given = meetingDecisions.answers.filter((answer) => answer.decisionId === decisionId);
	return given.sort((first, second) => first.answeredAt.localeCompare(second.answeredAt));
}
