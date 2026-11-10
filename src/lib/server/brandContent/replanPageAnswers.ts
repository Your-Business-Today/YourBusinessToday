import { fail } from '@sveltejs/kit';
import { formatUkDateTime } from '$lib/data/britishDate';
import { ReplanOutcomes, type ReplanOutcome } from '$lib/brand/plan/contentReplan';

const ReplanRefusalStatus = { notFound: 404, conflict: 409 } as const;

/** The plan page's answer to a move: the words of where the piece went, or a failure saying why it stayed. */
export function replanPageAnswerFor(outcome: ReplanOutcome, plannedFor: string) {
	if (outcome === ReplanOutcomes.moved) return { message: `Moved to ${formatUkDateTime(plannedFor)}.` };
	if (outcome === ReplanOutcomes.noSuchPiece) {
		return fail(ReplanRefusalStatus.notFound, { message: 'This piece is no longer in the brand’s content.' });
	}
	return fail(ReplanRefusalStatus.conflict, { message: 'This piece is published, so it stays on the day it went out.' });
}
