import { parseSightingSource, type SightingSourceKind } from '$lib/data/sightingRules';

/** A business a person's Claude saw on a public page, as recorded. */
export type Sighting = {
	id: string;
	sector: string;
	patchId: string | null;
	businessName: string;
	address: string;
	postcode: string;
	companyNumber: string;
	website: string;
	sourceUrl: string;
	sourceKind: SightingSourceKind;
	whatWasSeen: string;
	seenByAccountId: string;
	seenAt: string;
	clientId: string | null;
};

export const sightingColumns =
	'id, sector, patch_id, business_name, address, postcode, company_number, website, source_url, source_kind, what_was_seen, seen_by_account_id, seen_at, client_id';

export function parseSightingRecord(row: Record<string, unknown>): Sighting {
	return {
		id: row.id as string,
		sector: row.sector as string,
		patchId: (row.patch_id ?? null) as string | null,
		businessName: row.business_name as string,
		address: (row.address ?? '') as string,
		postcode: (row.postcode ?? '') as string,
		companyNumber: (row.company_number ?? '') as string,
		website: (row.website ?? '') as string,
		sourceUrl: row.source_url as string,
		sourceKind: parseSightingSource(row.source_kind) ?? 'other',
		whatWasSeen: (row.what_was_seen ?? '') as string,
		seenByAccountId: row.seen_by_account_id as string,
		seenAt: row.seen_at as string,
		clientId: (row.client_id ?? null) as string | null
	};
}
