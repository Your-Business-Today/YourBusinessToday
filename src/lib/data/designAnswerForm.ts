import { designReviewLimits, designReviewStates, type DesignReviewState } from './designReview';

/** The answers a YBT director gives a request from the Requested tab. */
export const designAnswerChoices = {
	approve: designReviewStates.approved,
	reject: designReviewStates.rejected
} as const;

export type DesignAnswerChoice = { state: DesignReviewState; reason: string } | { refusal: string };

export const designAnswerRefusals = {
	unknownAnswer: 'Approve or reject the request.',
	reasonRequired: 'Give the reason, for whoever asked for it.',
	reasonTooLong: `Keep the reason to ${designReviewLimits.longestText} characters.`
} as const;

/** The answer a form gives, with its reason: a rejection always gives one, and no reason is longer than a task holds. */
export function readDesignAnswerFromForm(formData: FormData): DesignAnswerChoice {
	const choice = String(formData.get('answer') ?? '');
	const state = Object.entries(designAnswerChoices).find(([name]) => name === choice)?.[1];
	if (state === undefined) return { refusal: designAnswerRefusals.unknownAnswer };
	const reason = String(formData.get('reason') ?? '').trim();
	if (reason.length > designReviewLimits.longestText) return { refusal: designAnswerRefusals.reasonTooLong };
	const isReasonMissing = state === designReviewStates.rejected && reason === '';
	if (isReasonMissing) return { refusal: designAnswerRefusals.reasonRequired };
	return { state, reason };
}
