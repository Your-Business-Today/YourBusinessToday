import { domainPageKinds } from '$lib/data/businessBrainDomain';
import { domainFilingLimits } from '$lib/data/businessBrainDomainRules';
import { isPageSlug, lengthRefusal, slugRefusal } from './businessBrainFieldRefusals';
import { trimmedText } from '$lib/data/trimmedText';
import { validateLifecycle } from './validateLifecycle';
import type { DomainRecordFactsGiven } from '$lib/data/businessBrainDomainFactsGiven';
import type { PlainObject } from '$lib/data/plainObject';

const { longestIdentity, longestKeptIn, mostMembers } = domainFilingLimits;

export const membersRefusal = `memberSlugs names the records and details that change together with the group's root, by their slugs: at most ${mostMembers}, each once, never the group itself.`;

export const membersOnGroupRefusal = 'memberSlugs belongs to a group (kind aggregate); a record names its group by being one of the group’s members.';

/** What makes the record, its lifecycle, where it is kept and a group's members, as given, or a sentence naming the first that does not fit. */
export function validateRecordFacts(entry: PlainObject, label: string): DomainRecordFactsGiven | string {
	const identity = trimmedText(entry.identity);
	const keptIn = trimmedText(entry.keptIn);
	const refusal = lengthRefusal('identity', identity, longestIdentity, false) ?? lengthRefusal('keptIn', keptIn, longestKeptIn, false);
	if (refusal !== null) return `${label}: ${refusal}`;
	const lifecycle = validateLifecycle(entry.lifecycle, trimmedText(entry.title), label);
	if (typeof lifecycle === 'string') return lifecycle;
	const memberSlugs = validateMembers(entry, label);
	if (typeof memberSlugs === 'string') return memberSlugs;
	return {
		...(identity === '' ? {} : { identity }),
		...(lifecycle.length === 0 ? {} : { lifecycle }),
		...(keptIn === '' ? {} : { keptIn }),
		...(memberSlugs.length === 0 ? {} : { memberSlugs })
	};
}

function validateMembers(entry: PlainObject, label: string): string[] | string {
	const given = entry.memberSlugs;
	if (given === undefined) return [];
	const isGroup = trimmedText(entry.kind) === domainPageKinds.aggregate;
	if (!isGroup) return `${label}: ${membersOnGroupRefusal}`;
	if (!Array.isArray(given) || given.length > mostMembers) return `${label}: ${membersRefusal}`;
	const memberSlugs = given.map(trimmedText);
	if (!memberSlugs.every(isPageSlug)) return `${label}: memberSlugs. ${slugRefusal}`;
	const isEachOnce = new Set(memberSlugs).size === memberSlugs.length;
	const isGroupItselfNamed = memberSlugs.includes(trimmedText(entry.slug));
	return isEachOnce && !isGroupItselfNamed ? memberSlugs : `${label}: ${membersRefusal}`;
}
