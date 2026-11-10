/** The approach a staff member's Claude drafted for a person, as it sent it: checked by validatePersonApproach before anything is written. */
export type PersonApproach = {
	personId: string;
	openingMessage: string;
	callPlan: string;
};

/** The limits on what an approach may write to the person's notes, stated once. */
export const personApproachLimits = {
	longestOpeningMessage: 1500,
	longestCallPlan: 3000
} as const;
