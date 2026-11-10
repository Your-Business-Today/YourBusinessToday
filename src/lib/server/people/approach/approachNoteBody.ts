import type { PersonApproach } from '$lib/data/personApproachRules';

/** The "Drafted approach" note, laid out as the site has always saved it: the opening message, then the call plan. */
export function approachNoteBody(approach: PersonApproach): string {
	return `Opening message\n${approach.openingMessage}\n\nCall plan\n${approach.callPlan}`;
}
