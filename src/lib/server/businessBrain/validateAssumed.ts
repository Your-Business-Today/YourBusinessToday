import { domainFilingLimits } from '$lib/data/businessBrainDomainRules';
import { validateTextList } from './validateTextList';
import type { DomainAssumedGiven } from '$lib/data/businessBrainDomainFactsGiven';

const { mostAssumed, longestAssumed } = domainFilingLimits;

export const assumedRefusal =
	`assumed is a list of at most ${mostAssumed} different sentences, each worded to follow "I assumed" and at most ${longestAssumed} characters.`;

/** What was assumed about a page, as given: kept only when some is given, so a page filed again without it asks it no more. */
export function validateAssumed(given: unknown): DomainAssumedGiven | null {
	const assumed = validateTextList(given, mostAssumed, (sentence) => sentence !== '' && sentence.length <= longestAssumed);
	if (assumed === null) return null;
	return assumed.length === 0 ? {} : { assumed };
}
