import { domainFilingLimits } from '$lib/data/businessBrainDomainRules';
import { everyRuleKind } from '$lib/data/domainRuleFacts';
import { governsRefusal } from '$lib/server/businessBrain/validateRuleFacts';
import { objectSchema, textField } from '../actionTypes';
import { reactorsRefusal } from '$lib/server/businessBrain/validateEventFacts';

const { longestStatus, longestWord, mostGuardedStations, mostReactingRoles, mostReactingRules } = domainFilingLimits;

const textList = (description: string) => ({ type: 'array', items: { type: 'string' }, description });

const reactorsEntry = objectSchema({
	roles: textList(`The roles that act on it, each by the glossary’s word for the role, at most ${mostReactingRoles}`),
	ruleSlugs: textList(`The whenever rules that follow it, by their slugs, at most ${mostReactingRules}`)
});

/** What an event page says of itself: the record and status it marks, and who reacts. */
export const eventFactProperties = {
	marksThingSlug: textField('Event: the record whose status change it marks, by its slug, filed before it or in the same call'),
	marksStatus: textField(`Event, with marksThingSlug: the status the record reaches, one of its statuses, at most ${longestStatus} characters`),
	reactors: { ...reactorsEntry, description: `Event: who reacts. ${reactorsRefusal}` }
};

/** What a rule page says of where it sits, by its kind. */
export const ruleFactProperties = {
	ruleKind: {
		type: 'string',
		enum: everyRuleKind,
		description:
			'Rule: gate (must hold before a task or a status change: "A work order is awarded only when the insurance is in date"), ' +
			'always (always true of a record or a group: "A job has one client"), whenever (what follows an event: "When a contract stack is signed, the first invoice is raised") ' +
			'or term (what a word or a number means: "Payment terms are 30 days from the invoice date")'
	},
	governs: textList(`Rule: the slugs of the things it governs. ${governsRefusal}`),
	guardsStationKeys: textList(`Gate: the keys of the workflow map stations it guards, at most ${mostGuardedStations}`),
	guardsThingSlug: textField('Gate: the record it guards, by its slug, with guardsStatus'),
	guardsStatus: textField(`Gate, with guardsThingSlug: the status the record may reach only when the gate holds, at most ${longestStatus} characters`),
	followsEventSlug: textField('Whenever: the event it follows, by its slug, filed before it or in the same call'),
	definesWord: textField(`Term: the glossary’s word whose meaning it states, at most ${longestWord} characters`)
};
