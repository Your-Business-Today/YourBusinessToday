/** What kind of thing was noticed about a business on a public page. */
export type ObservationKind = 'news' | 'public_post' | 'hiring' | 'website_change' | 'planning' | 'office_move' | 'other';

export const observationKindOrder: ObservationKind[] = ['news', 'public_post', 'hiring', 'website_change', 'planning', 'office_move', 'other'];

export const observationKindLabels: Record<ObservationKind, string> = {
	news: 'a news item',
	public_post: 'a public post',
	hiring: 'a hiring sign',
	website_change: 'a website change',
	planning: 'a planning notice',
	office_move: 'an office move',
	other: 'something else'
};

export function parseObservationKind(value: unknown): ObservationKind | null {
	return observationKindOrder.find((candidate) => candidate === value) ?? null;
}

/** What recording an observation takes, as typed: checked by validateObservation before anything is written. */
export type ObservationSeed = { companyNumber: string; sightingId: string; kind: string; headline: string; sourceUrl: string };

export const longestObservationHeadline = 200;

/** How many companies a weekly brief hands a Claude at once, so one run stays within a subscription's limits. */
export const briefCompaniesPerRun = 25;

/** How many sectors a brief names as most in need of a visit. */
export const briefSectorsPerRun = 10;
