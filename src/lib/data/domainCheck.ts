/** Which fault of a domain a candidate may be, in the order the domain check lists them. */
export const domainCheckKind = {
	nearDuplicate: 'nearDuplicate',
	wordClash: 'wordClash',
	naming: 'naming',
	ruleInMeaning: 'ruleInMeaning',
	misfiled: 'misfiled',
	untouched: 'untouched',
	thin: 'thin',
	looseReference: 'looseReference'
} as const;

export type DomainCheckKind = (typeof domainCheckKind)[keyof typeof domainCheckKind];

/** A page a candidate names, to be read whole before it is judged. */
export type DomainCheckPage = { pageId: string; title: string };

/** Something the site found in a domain that may be a fault, for the person's Claude to judge, with the pages to read first. */
export type DomainCheckCandidate = { kind: DomainCheckKind; finding: string; pages: DomainCheckPage[] };

/** Each kind of candidate as the domain check names it. */
export const domainCheckKindNames: Record<DomainCheckKind, string> = {
	nearDuplicate: 'Near-duplicate',
	wordClash: 'Word used two ways',
	naming: 'Named against the rules',
	ruleInMeaning: 'Rule inside a meaning',
	misfiled: 'Misfiled',
	untouched: 'Touched by nothing',
	thin: 'Thin page',
	looseReference: 'Loose reference'
};

/** How the domain check judges and lists: the shortest body a page should have, and how many candidates the walk lists. */
export const domainCheckLimits = { shortestBody: 120, mostCandidatesListed: 40 } as const;
