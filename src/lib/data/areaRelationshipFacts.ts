import { areaRelationshipPatterns, subdomainKinds, type AreaRelationshipFact, type AreaRelationshipPattern, type SubdomainKind } from './businessBrainDomain';
import { isPlainObject, type PlainObject } from './plainObject';

export const everyAreaRelationshipPattern: AreaRelationshipPattern[] = Object.values(areaRelationshipPatterns);

export const everySubdomainKind: SubdomainKind[] = Object.values(subdomainKinds);

/** The part an area plays; the core mark wins, and an area filed before areas had kinds reads as having none. */
export function readSubdomainKind(isCoreDomain: boolean, given: unknown): SubdomainKind | null {
	if (isCoreDomain) return subdomainKinds.core;
	const isOtherKind = given !== subdomainKinds.core && (everySubdomainKind as unknown[]).includes(given);
	return isOtherKind ? (given as SubdomainKind) : null;
}

/** How the areas relate, as the context map's facts list it; a row missing an area or a known pattern is left out. */
export function readAreaRelationships(given: unknown): AreaRelationshipFact[] {
	if (!Array.isArray(given)) return [];
	return given.filter(isPlainObject).filter(isWholeRelationship).map(relationshipFact);
}

function relationshipFact({ fromContextSlug, toContextSlug, passes, pattern }: PlainObject): AreaRelationshipFact {
	return { fromContextSlug, toContextSlug, passes, pattern } as AreaRelationshipFact;
}

function isWholeRelationship({ fromContextSlug, toContextSlug, passes, pattern }: PlainObject): boolean {
	const isEachAreaNamed = typeof fromContextSlug === 'string' && typeof toContextSlug === 'string';
	const isPatternKnown = (everyAreaRelationshipPattern as unknown[]).includes(pattern);
	return isEachAreaNamed && typeof passes === 'string' && isPatternKnown;
}
