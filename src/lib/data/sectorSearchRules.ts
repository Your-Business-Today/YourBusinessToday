import { parseSearchSource, searchSourceOrder, type SearchSource } from './searchSources';

/** What marking a sector searched records, as typed. */
export type SectorSearchSeed = { sector: string; source: string; foundCount: number; summary: string };

export type SectorSearch = { sector: string; source: SearchSource; foundCount: number; summary: string };

export const longestSectorSummary = 300;

export const sectorSearchNeedsSummary = 'Say in one line what was searched and found before marking the sector searched.';
export const sectorSearchNeedsSector = 'A sector is required, such as KT1 1.';
export const sectorSearchSourceRefusal = `The source is one of ${searchSourceOrder.join(', ')}.`;
export const sectorSearchCountRefusal = 'The found count is a whole number, zero or more.';

/** Why the search cannot be recorded as it stands, or null when every value fits its column. */
export function validateSectorSearch(seed: SectorSearchSeed): string | null {
	const { summary } = seed;
	if (seed.sector === '') return sectorSearchNeedsSector;
	if (parseSearchSource(seed.source) === null) return sectorSearchSourceRefusal;
	if (!Number.isInteger(seed.foundCount) || seed.foundCount < 0) return sectorSearchCountRefusal;
	if (summary === '') return sectorSearchNeedsSummary;
	if (summary.length > longestSectorSummary) return `The summary is at most ${longestSectorSummary} characters.`;
	return null;
}
