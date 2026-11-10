import { allDecisionAgreements, allDecisionAnswers } from './boardroomDecision';

/** The limits of boardroom_decisions, its answers and its rules (migration 0189), stated once for the service and the form. */
export const boardDecisionLimits = {
	longestReason: 2000,
	longestArticlesReference: 500,
	smallestQuorum: 1,
	largestQuorum: 20
} as const;

const { longestReason, longestArticlesReference, smallestQuorum, largestQuorum } = boardDecisionLimits;

export const boardDecisionRefusals = {
	itemNumberNotANumber: 'itemNumber is the number of an agenda item as read_board_meeting gives it now: a whole number from 1.',
	answerUnknown: `answer is the director’s own answer: one of ${allDecisionAnswers.join(', ')}.`,
	reasonTooLong: `reason is the director’s own reason, if they give one: at most ${longestReason} characters.`,
	quorumNotANumber: `quorum is how many directors must take part for a decision to carry: a whole number from ${smallestQuorum} to ${largestQuorum}.`,
	agreementUnknown: `agreement is one of ${allDecisionAgreements.join(', ')}: more of those taking part for it than against, or every one of them.`,
	castingVoteNotAnAnswer: 'chairHasCastingVote says whether the chair has a casting vote when the votes are equal: true or false.',
	articlesReferenceMissing: `articlesReference names where the company’s own articles say this: required, at most ${longestArticlesReference} characters.`,
	replacesNotAnId: 'replacesDecision is the id of an earlier decision of this board, as read_board_meeting gives it for the meeting that took it.',
	noSuchEarlierDecision: 'This board took no decision with that id at an earlier meeting, so a proposal cannot replace it.',
	itemNotOnAgenda: 'That number is not an item on the agenda as read_board_meeting gives it now.',
	noDecisionOnItem: 'Nothing is put to the directors on this item: only an item for decision that came out of the room agreed is.',
	meetingNotOpen: 'Directors answer a decision while its meeting is open.',
	callerHasNoSeat: 'Only a sitting director who was on this meeting answers its decisions, each for themselves.',
	callerNotSitting: 'Only a sitting director records how the board’s decisions carry.',
	alreadyAnswered: 'You have answered this decision already. An answer is kept as it was given and is not changed.'
} as const;

export function isFittingReason(reason: string): boolean {
	return reason.length <= longestReason;
}

export function isFittingArticlesReference(reference: string): boolean {
	return reference !== '' && reference.length <= longestArticlesReference;
}

export function isFittingQuorum(quorum: number): boolean {
	return Number.isInteger(quorum) && quorum >= smallestQuorum && quorum <= largestQuorum;
}
