/** Where a sighting was made: the kind of public page it was read on. */
export type SightingSourceKind = 'company_website' | 'directory' | 'news' | 'public_post' | 'planning_notice' | 'other';

export const sightingSourceOrder: SightingSourceKind[] = ['company_website', 'directory', 'news', 'public_post', 'planning_notice', 'other'];

export const sightingSourceLabels: Record<SightingSourceKind, string> = {
	company_website: "the business's own website",
	directory: 'a directory',
	news: 'a news item',
	public_post: 'a public post',
	planning_notice: 'a planning notice',
	other: 'another public page'
};

export function parseSightingSource(value: unknown): SightingSourceKind | null {
	return sightingSourceOrder.find((candidate) => candidate === value) ?? null;
}

/** What recording a sighting takes, as typed: checked by validateSighting before anything is written. */
export type SightingSeed = {
	sector: string;
	businessName: string;
	address: string;
	postcode: string;
	companyNumber: string;
	website: string;
	sourceUrl: string;
	sourceKind: string;
	whatWasSeen: string;
};

export const longestSightingName = 160;
export const longestSightingAddress = 300;
export const longestSightingNote = 500;

/** Pages behind a login, and the networks whose terms forbid reading them this way: never a source. */
export const refusedSourceHosts = ['linkedin.com', 'x.com', 'twitter.com', 'facebook.com', 'instagram.com'];

export function isRefusedSourceHost(hostname: string): boolean {
	const host = hostname.toLowerCase();
	return refusedSourceHosts.some((refused) => host === refused || host.endsWith(`.${refused}`));
}
