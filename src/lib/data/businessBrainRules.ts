/** The parts an organisation's brain is kept in, as business_brain_parts.kind accepts them (migration 0152). */
export const businessBrainPartKinds = ['expertise', 'experience', 'process', 'people'] as const;

export type BusinessBrainPartKind = (typeof businessBrainPartKinds)[number];

export const businessBrainPartNames: Record<BusinessBrainPartKind, string> = {
	expertise: 'Expertise',
	experience: 'Experience',
	process: 'Process',
	people: 'People'
};

export function isBusinessBrainPartKind(value: string): value is BusinessBrainPartKind {
	return (businessBrainPartKinds as readonly string[]).includes(value);
}

/** The limits on what is filed into Your Business Brain, stated once and mirrored by migration 0152. */
export const businessBrainLimits = {
	longestTitle: 200,
	longestSummary: 1000,
	longestSlug: 120,
	longestKind: 60,
	longestSourceTitle: 200,
	longestOrigin: 2000,
	longestSourceSummary: 1000
} as const;

/** The shapes migration 0152 checks a page's slug and kind against. */
export const businessBrainPatterns = {
	slug: /^[a-z0-9]+(-[a-z0-9]+)*$/,
	kind: /^[a-z]+(_[a-z]+)*$/
} as const;

/** Where what is filed came from: an earlier source by its id, or a new one described. */
export type BusinessBrainSourceGiven =
	| { sourceId: string }
	| { title: string; origin: string; summary: string };

/** A new page as a client's Claude files it, checked against its columns before anything is written. */
export type BusinessBrainPageGiven = {
	part: BusinessBrainPartKind;
	kind: string;
	slug: string;
	title: string;
	summary: string;
	body: string;
	source: BusinessBrainSourceGiven;
};

/** A revision of a page: what is not given (null) is kept as the page has it. */
export type BusinessBrainRevisionGiven = {
	pageId: string;
	kind: string | null;
	title: string;
	summary: string | null;
	body: string;
	source: BusinessBrainSourceGiven;
};

/** How much one reading of Your Business Brain gives back; search_business_brain (migration 0158) answers at most 50. */
export const businessBrainReadLimits = {
	longestSearch: 200,
	mostPagesFound: 20,
	mostPagesListed: 300,
	mostRevisionsListed: 50
} as const;

/** How many pages one file_business_brain_pages call files, each settled on its own. */
export const businessBrainFilingLimits = {
	mostPagesPerCall: 20
} as const;
