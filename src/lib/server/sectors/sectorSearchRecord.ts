import { parseSearchSource, type SearchSource } from '$lib/data/searchSources';

/** One search a person made of a sector, as recorded. */
export type RecordedSectorSearch = {
	id: string;
	patchId: string;
	sector: string;
	source: SearchSource;
	searchedByAccountId: string;
	searchedAt: string;
	foundCount: number;
	summary: string;
};

export const sectorSearchColumns = 'id, patch_id, sector, source, searched_by_account_id, searched_at, found_count, summary';

export function parseSectorSearchRecord(row: Record<string, unknown>): RecordedSectorSearch {
	return {
		id: row.id as string,
		patchId: row.patch_id as string,
		sector: row.sector as string,
		source: parseSearchSource(row.source) ?? 'open_web',
		searchedByAccountId: row.searched_by_account_id as string,
		searchedAt: row.searched_at as string,
		foundCount: Number(row.found_count ?? 0),
		summary: (row.summary ?? '') as string
	};
}
