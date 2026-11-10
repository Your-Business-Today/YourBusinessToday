import {
	allDecisionAgreements,
	allDecisionAnswers,
	decisionAgreements,
	decisionAnswers,
	decisionRuleSources,
	type BoardDecision,
	type DecisionAnswer,
	type DecisionRule
} from '$lib/data/boardroomDecision';

export const boardDecisionTables = {
	rules: 'boardroom_decision_rules',
	decisions: 'boardroom_decisions',
	answers: 'boardroom_decision_answers'
} as const;

export const decisionRuleColumns = 'quorum, agreement, chair_has_casting_vote, articles_reference';

export const boardDecisionColumns =
	'id, agenda_item_id, meeting_id, proposal_id, wording, chair_director_id, rule_source, quorum, agreement, ' +
	'chair_has_casting_vote, articles_reference, replaces_decision_id, opened_at';

export const decisionAnswerColumns = 'decision_id, director_id, answer, reason, answered_at';

function ruleOf(row: Record<string, unknown>, isOwn: boolean): DecisionRule {
	return {
		source: isOwn ? decisionRuleSources.ownArticles : decisionRuleSources.modelArticles,
		quorum: Number(row.quorum),
		agreement: allDecisionAgreements.find((agreement) => agreement === row.agreement) ?? decisionAgreements.majority,
		hasChairCastingVote: row.chair_has_casting_vote === true,
		articlesReference: (row.articles_reference as string | null) ?? null
	};
}

/** A rule the directors recorded from their own articles. */
export function parseDecisionRuleRecord(row: Record<string, unknown>): DecisionRule {
	return ruleOf(row, true);
}

export function parseBoardDecisionRecord(row: Record<string, unknown>): BoardDecision {
	return {
		id: row.id as string,
		agendaItemId: row.agenda_item_id as string,
		meetingId: row.meeting_id as string,
		proposalId: row.proposal_id as string,
		wording: String(row.wording ?? ''),
		chairDirectorId: row.chair_director_id as string,
		rule: ruleOf(row, row.rule_source === decisionRuleSources.ownArticles),
		replacesDecisionId: (row.replaces_decision_id as string | null) ?? null,
		openedAt: row.opened_at as string
	};
}

export function parseDecisionAnswerRecord(row: Record<string, unknown>): DecisionAnswer {
	return {
		decisionId: row.decision_id as string,
		directorId: row.director_id as string,
		answer: allDecisionAnswers.find((answer) => answer === row.answer) ?? decisionAnswers.abstains,
		reason: (row.reason as string | null) ?? null,
		answeredAt: row.answered_at as string
	};
}
