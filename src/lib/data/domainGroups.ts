import { domainPageKinds } from './businessBrainDomain';
import type { DomainPage } from './organisationDomain';
import type { DomainThing } from './domainReading';

/** The slug of the group a thing belongs to: the group that names it a member or its root, or null when none does. */
export function groupSlugOf(pages: DomainPage[], thingSlug: string): string | null {
	const groups = pages.filter((page) => page.kind === domainPageKinds.aggregate && page.slug !== thingSlug);
	const group = groups.find(({ facts }) => facts.memberSlugs.includes(thingSlug) || facts.aggregateRootSlug === thingSlug);
	return group?.slug ?? null;
}

/** A group's members as the domain holds them, in the order the group names them; a member not filed is left out. */
export function membersOf(things: DomainThing[], group: DomainThing): DomainThing[] {
	return group.memberSlugs.flatMap((slug) => things.filter((thing) => thing.slug === slug));
}
