import { boardDecisionRefusals, isFittingArticlesReference, isFittingQuorum } from './boardroomDecisionRules';
import { allDecisionAgreements, decisionRuleSources, type DecisionRule } from './boardroomDecision';
import { readTrimmed } from './boardPaperInput';

function readCastingVote(value: unknown): boolean | null {
	if (typeof value === 'boolean') return value;
	return null;
}

/** A company's own rule for its directors' decisions, as given, or the sentence naming what does not fit. */
export function validateDecisionRule(input: Record<string, unknown>): DecisionRule | string {
	const quorum = input.quorum;
	if (typeof quorum !== 'number' || !isFittingQuorum(quorum)) return boardDecisionRefusals.quorumNotANumber;
	const agreement = allDecisionAgreements.find((known) => known === input.agreement);
	if (agreement === undefined) return boardDecisionRefusals.agreementUnknown;
	const hasChairCastingVote = readCastingVote(input.chairHasCastingVote);
	if (hasChairCastingVote === null) return boardDecisionRefusals.castingVoteNotAnAnswer;
	const articlesReference = readTrimmed(input, 'articlesReference');
	if (!isFittingArticlesReference(articlesReference)) return boardDecisionRefusals.articlesReferenceMissing;
	return { source: decisionRuleSources.ownArticles, quorum, agreement, hasChairCastingVote, articlesReference };
}
