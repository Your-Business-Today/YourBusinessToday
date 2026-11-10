import { decisionAgreements, decisionRuleSources, type DecisionRule } from './boardroomDecision';
import { decisionReasons, type DecisionReason, type DecisionResult } from './boardDecisionResult';

const agreementWords = {
	[decisionAgreements.majority]: 'more of the directors taking part for it than against carries it',
	[decisionAgreements.unanimous]: 'every director taking part agreeing carries it'
} as const;

const modelArticlesAside =
	' A board of one director decides alone (article 7(2)); a decision taken outside a meeting needs every eligible ' +
	'director to agree (article 8), and every decision here is taken at a meeting.';

function castingVoteWords(rule: DecisionRule): string {
	return rule.hasChairCastingVote ? 'the chair has a casting vote when the votes are equal' : 'the chair has no casting vote';
}

/** How a decision carries, in a sentence: the model articles unless the company recorded its own. */
export function decisionRuleSentence(rule: DecisionRule): string {
	const terms = `${agreementWords[rule.agreement]}, with at least ${rule.quorum} taking part, and ${castingVoteWords(rule)}.`;
	if (rule.source === decisionRuleSources.ownArticles) return `By the company’s own articles (${rule.articlesReference}): ${terms}`;
	return `By the model articles: ${terms}${modelArticlesAside}`;
}

const resultWords: Record<DecisionReason, string> = {
	[decisionReasons.waiting]: 'Waiting for every director’s own answer.',
	[decisionReasons.soleDirector]: 'the board’s only director decided alone (model article 7(2)).',
	[decisionReasons.majority]: 'more directors agreed than disagreed.',
	[decisionReasons.castingVote]: 'the votes were equal, and it went the way the chair answered, on the chair’s casting vote.',
	[decisionReasons.everyDirector]: 'every director taking part agreed.',
	[decisionReasons.shortOfQuorum]: 'fewer directors took part than the quorum.',
	[decisionReasons.notCarried]: 'it did not have the agreement the rule asks for.'
};

/** The decision's result, in a sentence. */
export function decisionResultSentence(result: DecisionResult): string {
	const why = resultWords[result.reason];
	if (!result.isDecided) return why;
	return result.isCarried ? `Carried: ${why}` : `Not carried: ${why}`;
}

/** The answer when a company's own rule is recorded. */
export function decisionRuleRecordedWords(organisationName: string, rule: DecisionRule): string {
	const recorded = `Recorded for ${organisationName}. A decision put to the directors from now on carries ${decisionRuleSentence(rule)}`;
	return `${recorded} Decisions already put keep the rule they were put with, and every earlier rule is kept as recorded.`;
}
