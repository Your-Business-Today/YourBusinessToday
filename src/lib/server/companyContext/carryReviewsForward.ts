import { isTheSamePart } from '$lib/data/companyContext/samePart';
import { reviewStates } from '$lib/data/companyContext/companyContext';
import type { CompanyContextDraft, CompanyContextVersion, ContextPart } from '$lib/data/companyContext/companyContext';

/** A new version with the client's review kept on every part it leaves as it was, and how many reviews that kept. */
export type CarriedDraft = { draft: CompanyContextDraft; keptReviewCount: number };

/**
 * Keeps what the client last said of each part the new version leaves unchanged, so nothing they checked has to be
 * checked again. A part the client's Claude gives a review of its own keeps that one; a part put differently, or
 * new, starts not checked, so the client checks it.
 */
export function carryReviewsForward(draft: CompanyContextDraft, earlier: CompanyContextVersion | null): CarriedDraft {
	if (earlier === null) return { draft, keptReviewCount: 0 };
	let keptReviewCount = 0;
	const parts = draft.parts.map((part) => {
		const carried = withEarlierReview(part, draft, earlier);
		if (carried !== part) keptReviewCount += 1;
		return carried;
	});
	return { draft: { ...draft, parts }, keptReviewCount };
}

function withEarlierReview(part: ContextPart, draft: CompanyContextDraft, earlier: CompanyContextVersion): ContextPart {
	if (part.reviewState !== reviewStates.notChecked) return part;
	const earlierPart = earlier.parts.find((candidate) => candidate.key === part.key);
	if (earlierPart === undefined) return part;
	if (earlierPart.reviewState === reviewStates.notChecked) return part;
	const isUnchanged = isTheSamePart({ part: earlierPart, context: earlier }, { part, context: draft });
	if (!isUnchanged) return part;
	return { ...part, reviewState: earlierPart.reviewState, whatIsWrong: earlierPart.whatIsWrong };
}
