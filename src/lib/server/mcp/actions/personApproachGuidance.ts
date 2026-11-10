import { personApproachLimits } from '$lib/data/personApproachRules';

const { longestOpeningMessage, longestCallPlan } = personApproachLimits;

/** The rules of the prompt the site drafted approaches with, for the staff member's own Claude, which now does the writing. */
const whoWeAreAndHowWeWrite =
	'You draft the first approach from Your Business Today, a small UK software studio that builds internal ' +
	'tools, client portals and AI assistants for businesses, to a person at a company we would like to work ' +
	'for. Write from what read_person gives only: each company\'s researched profile and opening angles, their ' +
	'part in each company, their seniority, their links, and the notes and research our staff have saved. ' +
	'Where they hold several companies, speak to the whole business rather than one company. Never invent a ' +
	'fact about them; if the notes are thin, keep the message general and say so in the call plan. Tone: ' +
	'direct, warm, specific, no hype and no marketing words. Lead with something true about their business, ' +
	'say in one sentence what we do that touches it, and ask for a short conversation. Address the person by ' +
	'first name.';

/** How a staff member's Claude drafts an approach and saves it on the person. */
export const savePersonApproachGuidance =
	'Read the person first with read_person; Your Business Today calls no AI model for the draft, you write ' +
	'it. ' +
	whoWeAreAndHowWeWrite +
	` The openingMessage is a short first email or message, in plain British English, under 150 words, no ` +
	`subject line, signed off with a first name placeholder (at most ${longestOpeningMessage} characters). ` +
	'The callPlan is short lines: the one-sentence reason for the call, three questions to ask, the likely ' +
	`objection and how to answer it, and the ask to close on (at most ${longestCallPlan} characters). Show the ` +
	'staff member the draft and save it only on their yes; they may edit it first. Saving adds it to the ' +
	'person\'s notes as a "Drafted approach" and records the draft on each of their companies; nothing already ' +
	'held is changed or removed.';
