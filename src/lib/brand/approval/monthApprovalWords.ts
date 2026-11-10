import { stageInSentenceOf } from '../content/contentWords';
import { LeftReasons, type LeftReason, type MonthApprovalGiven, type PieceLeft } from './monthApproval';

const justOne = 1;
const nothingWaiting = 0;

const leftReasonWords: Record<LeftReason, (piece: PieceLeft) => string> = {
	[LeftReasons.notInMonth]: () => 'it is not on this month’s plan',
	[LeftReasons.changedSince]: () => 'it changed after it was read, so read it again before approving it',
	[LeftReasons.movedOn]: ({ stage }) => `it is ${stageInSentenceOf(stage ?? '')} now, no longer awaiting approval`,
	[LeftReasons.takenFirst]: () => 'someone else moved it on while it was being approved'
};

function countOf(count: number, noun: string): string {
	return count === justOne ? `${count} ${noun}` : `${count} ${noun}s`;
}

function nameOf({ title, medium, contentPieceId }: PieceLeft): string {
	if (title === null) return `The piece ${contentPieceId}`;
	return `“${title}” on ${medium}`;
}

/** One piece left as it was, named, with why. */
export function describePieceLeft(piece: PieceLeft): string {
	return `${nameOf(piece)} was left as it was: ${leftReasonWords[piece.reason](piece)}.`;
}

/** What a month's approval came to: how many were approved, how many of those posts still wait on a picture, and each piece left. */
export function describeApprovalGiven(given: MonthApprovalGiven): string {
	const { approvedCount, postCount, awaitingPictureCount, monthLabel, left } = given;
	const approved = `Approved ${countOf(approvedCount, 'piece')} on ${countOf(postCount, 'post')} for ${monthLabel}.`;
	return [approved, ...pictureLinesOf(awaitingPictureCount), ...left.map(describePieceLeft)].join(' ');
}

function pictureLinesOf(awaitingPictureCount: number): string[] {
	if (awaitingPictureCount === nothingWaiting) return [];
	if (awaitingPictureCount === justOne) return ['1 approved post still waits on its picture.'];
	return [`${awaitingPictureCount} approved posts still wait on their pictures.`];
}
