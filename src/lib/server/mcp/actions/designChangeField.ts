import { designReviewLimits, designReviewStageName } from '$lib/data/designReview';
import { proseField, readOptionalText } from '../actionTypes';

export const designChangeField = proseField(
	'Only for a request that falls outside or changes the system’s design patterns, or that needs an ' +
		'infrastructure change or upgrade, costs money, or adds a new dependency (ours or a third ' +
		'party’s), after you have pushed back and the person still wants it: what it changes, what it ' +
		'costs or depends on, and why they need it, in their words. The task then waits as ' +
		`${designReviewStageName}, and nothing builds it until YBT approves it. Leave out for a request ` +
		'that extends the design in the shape it already has, and for a bug fix that needs none of these'
);

export const designReasonField = proseField('Why, in a sentence or two, for whoever asked for it');

export type DesignTextChoice = { text: string | undefined } | { refusal: string };

export function isDesignTextRefused(choice: DesignTextChoice): choice is { refusal: string } {
	return 'refusal' in choice;
}

/** A design change or a reason as given, left out when empty, refused by name when longer than a task holds. */
export function validateDesignText(input: Record<string, unknown>, field: string): DesignTextChoice {
	const text = readOptionalText(input, field);
	if (text === null) return { text: undefined };
	const { longestText } = designReviewLimits;
	if (text.length <= longestText) return { text };
	return { refusal: `${field} is ${text.length} characters; keep it to ${longestText}. Nothing was changed.` };
}
