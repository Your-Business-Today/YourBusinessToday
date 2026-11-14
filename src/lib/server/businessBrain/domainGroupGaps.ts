import { domainPageKinds } from '$lib/data/businessBrainDomain';
import type { DomainFilingGiven, DomainPageWriteGiven } from '$lib/data/businessBrainDomainRules';
import type { DomainFactsGiven } from '$lib/data/businessBrainDomainFactsGiven';
import type { DomainPage } from '$lib/data/organisationDomain';

/** A group naming a member the domain does not hold, or a record named a member of two groups. */
export type DomainGroupGap = { groupSlug: string; unknownMemberSlug: string } | { memberSlug: string; groupSlugs: string[] };

/** The kinds a group's members may be: the records and details that change together with its root. */
const memberKinds: string[] = [domainPageKinds.entity, domainPageKinds.valueObject];

function membersWritten({ facts }: DomainPageWriteGiven): string[] {
	return (facts as DomainFactsGiven | null)?.memberSlugs ?? [];
}

/** Each group's members once the filing is in: what this call writes, else what was filed before. */
function membersByGroup({ pages }: DomainFilingGiven, filedPages: DomainPage[]): Map<string, string[]> {
	const isGroup = (page: { kind: string }) => page.kind === domainPageKinds.aggregate;
	const filed = filedPages.filter(isGroup).map(({ slug, facts }): [string, string[]] => [slug, facts.memberSlugs]);
	const written = pages.filter(isGroup).map((page): [string, string[]] => [page.slug, membersWritten(page)]);
	return new Map([...filed, ...written]);
}

/** The first member a group this call writes names that the domain will not hold, or that another group names too; null when none. */
export function firstGroupGap(filing: DomainFilingGiven, filedPages: DomainPage[]): DomainGroupGap | null {
	const possibleMembers = [...filedPages, ...filing.pages].filter((page) => memberKinds.includes(page.kind));
	const known = new Set(possibleMembers.map((page) => page.slug));
	const groups = membersByGroup(filing, filedPages);
	const writtenGroups = filing.pages.filter((page) => page.kind === domainPageKinds.aggregate);
	for (const group of writtenGroups) {
		const unknownMemberSlug = membersWritten(group).find((slug) => !known.has(slug));
		if (unknownMemberSlug !== undefined) return { groupSlug: group.slug, unknownMemberSlug };
		const shared = sharedMemberOf(group.slug, groups);
		if (shared !== null) return shared;
	}
	return null;
}

function sharedMemberOf(groupSlug: string, groups: Map<string, string[]>): DomainGroupGap | null {
	for (const memberSlug of groups.get(groupSlug) ?? []) {
		const groupSlugs = [...groups].filter(([, members]) => members.includes(memberSlug)).map(([slug]) => slug);
		if (groupSlugs.length > 1) return { memberSlug, groupSlugs };
	}
	return null;
}
