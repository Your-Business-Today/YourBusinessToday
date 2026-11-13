import { subdomainKinds, type DomainTermFact, type SubdomainKind } from '$lib/data/businessBrainDomain';
import type { DomainAreaRelationship, DomainContextSummary } from '$lib/data/organisationDomain';

const partWords: Record<SubdomainKind, string> = {
	[subdomainKinds.core]: 'the core domain',
	[subdomainKinds.supporting]: 'a supporting subdomain',
	[subdomainKinds.generic]: 'a generic subdomain'
};

/** A context's heading: its title and slug, and the part it plays when it has been said. */
export function contextHeading({ title, slug, subdomain }: DomainContextSummary): string {
	const part = subdomain === null ? '' : ` — ${partWords[subdomain]}`;
	return `## ${title} (${slug})${part}`;
}

/** One relationship of the context map: which context passes what to which, and whose terms win. */
export function relationshipLine({ fromTitle, fromContextSlug, toTitle, toContextSlug, passes, pattern }: DomainAreaRelationship): string {
	return `- ${fromTitle} (${fromContextSlug}) to ${toTitle} (${toContextSlug}): passes ${passes}; ${pattern}`;
}

/** One word of a glossary with its meaning, then what it names, its other names and whether it is a role. */
export function termLine(term: DomainTermFact): string {
	const { word, meaning, namesThingSlug, namesStatus, isRole, otherNames } = term;
	const status = namesStatus === null ? '' : ` in ${namesStatus}`;
	const naming = [
		namesThingSlug === null ? '' : `names ${namesThingSlug}${status}`,
		otherNames.length === 0 ? '' : `also called ${otherNames.join(', ')}`,
		isRole ? 'a role' : ''
	].filter((part) => part !== '');
	const named = naming.length === 0 ? '' : ` (${naming.join('; ')})`;
	return `- **${word}**: ${meaning}${named}`;
}
