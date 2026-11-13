import { domainFilingLimits } from '$lib/data/businessBrainDomainRules';
import { everyAreaRelationshipPattern } from '$lib/data/areaRelationshipFacts';
import { isPageSlug, lengthRefusal, slugRefusal } from './businessBrainFieldRefusals';
import { isPlainObject, type PlainObject } from '$lib/data/plainObject';
import { trimmedText } from '$lib/data/trimmedText';
import type { AreaRelationshipFact, AreaRelationshipPattern } from '$lib/data/businessBrainDomain';
import type { DomainContextMapFactsGiven } from '$lib/data/businessBrainDomainFactsGiven';

const { mostRelationships, longestPasses } = domainFilingLimits;

export const relationshipsRefusal = `The relationships are a list of at most ${mostRelationships}, each from one context to another, once for each pair.`;

/** Whose terms win under each pattern, said once for the filing's description and its refusal. */
export const patternMeanings =
	'customer_supplier (the receiving context says what it needs), conformist (it takes it as it comes), shared_kernel (both keep the same record), ' +
	'anticorruption_layer (the receiving context renames it into its own words) or published_language (a fixed format both follow)';

export const patternRefusal = `The pattern says whose terms win, one of ${patternMeanings}.`;

/** How the areas relate as the context map gives it, or a sentence naming the first row that does not fit. */
export function validateAreaRelationships(given: unknown, label: string): DomainContextMapFactsGiven | string {
	if (given === undefined) return { relationships: [] };
	if (!Array.isArray(given) || given.length > mostRelationships) return `${label}: ${relationshipsRefusal}`;
	const relationships: AreaRelationshipFact[] = [];
	for (const [index, relationship] of given.entries()) {
		const checked = validateRelationship(isPlainObject(relationship) ? relationship : {});
		if (typeof checked === 'string') return `${label}, relationship ${index + 1}: ${checked}`;
		relationships.push(checked);
	}
	const pairs = relationships.map(({ fromContextSlug, toContextSlug }) => `${fromContextSlug}>${toContextSlug}`);
	const isEachPairOnce = new Set(pairs).size === pairs.length;
	return isEachPairOnce ? { relationships } : `${label}: ${relationshipsRefusal}`;
}

function validateRelationship(relationship: PlainObject): AreaRelationshipFact | string {
	const fromContextSlug = trimmedText(relationship.fromContextSlug);
	const toContextSlug = trimmedText(relationship.toContextSlug);
	const isEachAreaASlug = isPageSlug(fromContextSlug) && isPageSlug(toContextSlug);
	if (!isEachAreaASlug) return `fromContextSlug and toContextSlug each name a context by its slug. ${slugRefusal}`;
	if (fromContextSlug === toContextSlug) return `${fromContextSlug} relates to another context, never to itself.`;
	const passes = trimmedText(relationship.passes);
	const refusal = lengthRefusal('passes', passes, longestPasses, true);
	if (refusal !== null) return refusal;
	const pattern = trimmedText(relationship.pattern);
	if (!isPattern(pattern)) return patternRefusal;
	return { fromContextSlug, toContextSlug, passes, pattern };
}

function isPattern(pattern: string): pattern is AreaRelationshipPattern {
	return (everyAreaRelationshipPattern as string[]).includes(pattern);
}
