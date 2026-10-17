export const reviewDecisions = { keepBoth: 'keep_both', merge: 'merge', replace: 'replace' } as const;

export type ReviewDecision = (typeof reviewDecisions)[keyof typeof reviewDecisions];

const reviewDecisionOrder: ReviewDecision[] = Object.values(reviewDecisions);

export const reviewDecisionLabels: Record<ReviewDecision, string> = {
	keep_both: 'Keep both',
	merge: 'Merge it into this one',
	replace: 'Replace this one with it'
};

export const reviewDecisionRefusal = `A review is answered ${reviewDecisionOrder.join(', ')}.`;

/** A task raised anyway that looks like this one, waiting on this task's raiser to say what becomes of the two. */
export type SimilarTaskReview = {
	id: string;
	newTaskId: string;
	newTaskTitle: string;
	newProjectName: string;
};

/** The decision a value names, or null when it is not one of the three — never guessed. */
export function validateReviewDecision(value: unknown): ReviewDecision | null {
	return reviewDecisionOrder.find((decision) => decision === value) ?? null;
}

/** The question each similar task's raiser is asked, on their own task. */
export function similarTaskReviewQuestion(newTaskTitle: string, newProjectName: string, raiserName: string): string {
	return (
		`${raiserName} raised "${newTaskTitle}" on ${newProjectName} anyway, though it looks like this task. ` +
		'Keep both, merge it into this one, or replace this one with it?'
	);
}
