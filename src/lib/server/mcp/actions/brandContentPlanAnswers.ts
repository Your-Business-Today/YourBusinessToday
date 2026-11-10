import { noSuchPiece } from './brandContentAnswers';
import type { ReplanOutcome } from '$lib/brand/plan/contentReplan';

/** What move_content_to_day says of each outcome. */
export const replanAnswers: Record<ReplanOutcome, (plannedFor: string) => string> = {
	moved: (plannedFor) => `Moved: the piece now goes out at ${plannedFor}. Call read_content_plan to see the month.`,
	noSuchPiece: () => noSuchPiece,
	hasGoneOut: () => 'The piece was not moved: it is published, so it stays on the day it went out. Nothing was changed.'
};
