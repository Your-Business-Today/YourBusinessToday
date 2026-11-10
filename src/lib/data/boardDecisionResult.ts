import { decisionAgreements, decisionAnswers, type DecisionAnswer, type DecisionRule } from './boardroomDecision';

/** Why a decision carried or did not, or that it still waits for answers. */
export type DecisionReason =
	| 'waiting'
	| 'sole_director'
	| 'majority'
	| 'casting_vote'
	| 'every_director'
	| 'short_of_quorum'
	| 'not_carried';

export const decisionReasons = {
	waiting: 'waiting',
	soleDirector: 'sole_director',
	majority: 'majority',
	castingVote: 'casting_vote',
	everyDirector: 'every_director',
	shortOfQuorum: 'short_of_quorum',
	notCarried: 'not_carried'
} as const;

/** One decision as the answers stand: the rule, the chair, every answer, who is still to answer, and how many sat on it. */
export type DecisionCount = {
	rule: DecisionRule;
	chairDirectorId: string;
	answers: DecisionAnswer[];
	waitingFor: string[];
	directorsOnMeeting: number;
};

export type DecisionResult = { isDecided: boolean; isCarried: boolean; reason: DecisionReason };

const waiting: DecisionResult = { isDecided: false, isCarried: false, reason: decisionReasons.waiting };

function decided(isCarried: boolean, reason: DecisionReason): DecisionResult {
	return { isDecided: true, isCarried, reason };
}

function countOf(count: DecisionCount, kind: string): number {
	return count.answers.filter((answer) => answer.answer === kind).length;
}

function chairsCastingVote(count: DecisionCount): DecisionResult {
	const { rule, answers, chairDirectorId } = count;
	const chairs = answers.find((answer) => answer.directorId === chairDirectorId);
	const isCastable = rule.hasChairCastingVote && chairs !== undefined && chairs.answer !== decisionAnswers.abstains;
	if (!isCastable) return decided(false, decisionReasons.notCarried);
	return decided(chairs.answer === decisionAnswers.agrees, decisionReasons.castingVote);
}

function byMajority(count: DecisionCount): DecisionResult {
	const forIt = countOf(count, decisionAnswers.agrees);
	const againstIt = countOf(count, decisionAnswers.disagrees);
	if (forIt > againstIt) return decided(true, decisionReasons.majority);
	if (forIt === againstIt && forIt > 0) return chairsCastingVote(count);
	return decided(false, decisionReasons.notCarried);
}

function byEveryDirector(count: DecisionCount): DecisionResult {
	const isEveryOneFor = count.answers.every((answer) => answer.answer === decisionAnswers.agrees);
	return decided(isEveryOneFor, isEveryOneFor ? decisionReasons.everyDirector : decisionReasons.notCarried);
}

/**
 * How a decision stands once every director on the meeting has answered. A board of one decides alone (model
 * article 7(2)); otherwise fewer than the quorum taking part carries nothing, and the rule decides the rest.
 */
export function decisionResultOf(count: DecisionCount): DecisionResult {
	const { waitingFor, answers, rule } = count;
	if (waitingFor.length > 0) return waiting;
	const [onlyAnswer] = answers;
	const isSoleDirector = count.directorsOnMeeting === 1 && answers.length === 1;
	if (isSoleDirector) return decided(onlyAnswer.answer === decisionAnswers.agrees, decisionReasons.soleDirector);
	if (answers.length < rule.quorum) return decided(false, decisionReasons.shortOfQuorum);
	if (rule.agreement === decisionAgreements.unanimous) return byEveryDirector(count);
	return byMajority(count);
}
