/**
 * Where a request that changes a system's design stands with YBT. A task that only extends the design
 * has no review at all; one that changes it waits as requested until YBT approves or rejects it.
 */
export type DesignReviewState = 'awaiting' | 'approved' | 'rejected';

export const designReviewStates = { awaiting: 'awaiting', approved: 'approved', rejected: 'rejected' } as const;

export type DesignReview = {
	state: DesignReviewState;
	change: string;
	reason: string;
	reviewedBy: string | null;
	reviewedAt: string | null;
};

/** The longest description of a design change, or of YBT's reason, that a task holds; 0280 holds the same. */
export const designReviewLimits = { longestText: 2000 } as const;

export const designReviewStageName = 'Requested, awaiting YBT approval';

const reviewStateOrder: DesignReviewState[] = Object.values(designReviewStates);

const heldStates: DesignReviewState[] = [designReviewStates.awaiting, designReviewStates.rejected];

export function parseDesignReview(row: Record<string, unknown>): DesignReview | null {
	const state = reviewStateOrder.find((candidate) => candidate === row.design_review_state) ?? null;
	if (state === null) return null;
	return {
		state,
		change: (row.design_change as string) ?? '',
		reason: (row.design_review_reason as string) ?? '',
		reviewedBy: (row.design_reviewed_by as string) ?? null,
		reviewedAt: (row.design_reviewed_at as string) ?? null
	};
}

/** A task held by its design review is never built: it waits for YBT's approval, or YBT turned it down. */
export function isHeldForDesignReview(review: DesignReview | null): boolean {
	if (review === null) return false;
	return heldStates.includes(review.state);
}

export function isAwaitingDesignApproval(review: DesignReview | null): boolean {
	return review?.state === designReviewStates.awaiting;
}

export const designReviewHoldRefusal =
	`This task changes the system's design and is ${designReviewStageName.toLowerCase()}, or YBT ` +
	'turned it down: nothing builds it until YBT approves it with approve_design_change.';

const stateSentences: Record<DesignReviewState, string> = {
	awaiting: `Design: ${designReviewStageName}. Nothing builds it until YBT approves it.`,
	approved: 'Design: changes the design, approved by YBT.',
	rejected: 'Design: changes the design, and YBT turned it down. It is not built.'
};

/** The line read_task gives a task's design review, or null when the task only extends the design. */
export function designReviewLine(review: DesignReview | null): string | null {
	if (review === null) return null;
	const change = review.change === '' ? '' : ` What it changes: ${review.change}`;
	const reason = review.reason === '' ? '' : ` YBT's reason: ${review.reason}`;
	return `${stateSentences[review.state]}${change}${reason}`;
}
