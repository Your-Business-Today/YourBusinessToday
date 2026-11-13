import { domainFilingLimits } from '$lib/data/businessBrainDomainRules';
import { isPageSlug } from './businessBrainFieldRefusals';
import { isPlainObject, type PlainObject } from '$lib/data/plainObject';
import { validateRecordInStatus, type RecordInStatus } from './validateRecordInStatus';
import { validateTextList } from './validateTextList';
import type { DomainEventFactsGiven } from '$lib/data/businessBrainDomainFactsGiven';
import type { DomainEventReactors } from '$lib/data/domainRuleFacts';

const { longestWord, mostReactingRoles, mostReactingRules } = domainFilingLimits;

const markNames = { thing: 'marksThingSlug', status: 'marksStatus' };

export const reactorsRefusal =
	`reactors says who reacts to the event: roles, the glossary's words for them, at most ${mostReactingRoles}, each at most ${longestWord} characters; ` +
	`and ruleSlugs, the rules that follow it by their slugs, at most ${mostReactingRules}; each given once.`;

/** What an event marks and who reacts as given, null when it is given neither, or a sentence naming the first that does not fit. */
export function validateEventFacts(entry: PlainObject, label: string): DomainEventFactsGiven | string | null {
	const marks = validateRecordInStatus(entry, markNames);
	if (typeof marks === 'string') return `${label}: ${marks}`;
	const reactors = validateReactors(entry.reactors);
	if (reactors === undefined) return `${label}: ${reactorsRefusal}`;
	const facts = { ...marksGiven(marks), ...(reactors === null ? {} : { reactors }) };
	return Object.keys(facts).length === 0 ? null : facts;
}

function marksGiven(marks: RecordInStatus | null): DomainEventFactsGiven {
	if (marks === null) return {};
	const { thingSlug, status } = marks;
	return status === '' ? { marksThingSlug: thingSlug } : { marksThingSlug: thingSlug, marksStatus: status };
}

function validateReactors(given: unknown): DomainEventReactors | null | undefined {
	if (given === undefined) return null;
	if (!isPlainObject(given)) return undefined;
	const roles = validateTextList(given.roles, mostReactingRoles, (role) => role !== '' && role.length <= longestWord);
	const ruleSlugs = validateTextList(given.ruleSlugs, mostReactingRules, isPageSlug);
	if (roles === null || ruleSlugs === null) return undefined;
	return roles.length + ruleSlugs.length === 0 ? null : { roles, ruleSlugs };
}
