import { describeApprovalGiven } from '$lib/brand/approval/monthApprovalWords';
import { noSuchPiece } from './brandContentAnswers';
import { MonthApprovalKinds, type MonthApprovalOutcome } from '$lib/brand/approval/monthApproval';
import type { ReplanOutcome } from '$lib/brand/plan/contentReplan';

/** What move_content_to_day says of each outcome. */
export const replanAnswers: Record<ReplanOutcome, (plannedFor: string) => string> = {
	moved: (plannedFor) => `Moved: the piece now goes out at ${plannedFor}. Call read_content_plan to see the month.`,
	noSuchPiece: () => noSuchPiece,
	hasGoneOut: () => 'The piece was not moved: it is published, so it stays on the day it went out. Nothing was changed.'
};

const noneLeft = 0;
const askForChangeAfter = 'To ask for a change to one post, call review_content on its piece with verdict changes_requested.';
const readAgain = 'Call read_content_plan to read the month again; only what it gives is approved.';

/** What approve_content_month says: why nothing was approved, or how many were and each piece left as it was. */
export function monthApprovalAnswerOf(outcome: MonthApprovalOutcome): string {
	if (outcome.kind === MonthApprovalKinds.refused) return `Nothing was approved: ${outcome.problem}. Nothing was changed.`;
	const { left } = outcome;
	const isAnyLeft = left.length > noneLeft;
	return [describeApprovalGiven(outcome), isAnyLeft ? readAgain : askForChangeAfter].join(' ');
}
