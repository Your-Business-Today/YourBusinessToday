import { reviewStates } from './companyContext';
import type { ContextPart, ReviewState } from './companyContext';

/** How far the client has got checking the parts: how many they have checked, and how many of those are right. */
export type ReviewTally = { partCount: number; checkedCount: number; rightCount: number; notRightCount: number };

export function tallyReviews(parts: ContextPart[]): ReviewTally {
	const countOf = (state: ReviewState) => parts.filter((part) => part.reviewState === state).length;
	const rightCount = countOf(reviewStates.right);
	const notRightCount = countOf(reviewStates.notRight);
	return { partCount: parts.length, checkedCount: rightCount + notRightCount, rightCount, notRightCount };
}

/** The tally as the map says it: how many of the parts are checked, and how many are right and not right. */
export function reviewTallySentence(tally: ReviewTally): string {
	const checked = `${tally.checkedCount} of ${tally.partCount} parts checked`;
	return `${checked}: ${tally.rightCount} right, ${tally.notRightCount} not right.`;
}
