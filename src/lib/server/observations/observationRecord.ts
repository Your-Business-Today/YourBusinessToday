import { parseObservationKind, type ObservationKind } from '$lib/data/observationRules';

/** Something noticed about a business on a public page, as recorded. */
export type Observation = {
	id: string;
	patchId: string;
	companyNumber: string;
	sightingId: string | null;
	clientId: string | null;
	kind: ObservationKind;
	headline: string;
	sourceUrl: string;
	observedAt: string;
	observedByAccountId: string;
};

export const observationColumns = 'id, patch_id, company_number, sighting_id, client_id, kind, headline, source_url, observed_at, observed_by_account_id';

export function parseObservationRecord(row: Record<string, unknown>): Observation {
	return {
		id: row.id as string,
		patchId: row.patch_id as string,
		companyNumber: (row.company_number ?? '') as string,
		sightingId: (row.sighting_id ?? null) as string | null,
		clientId: (row.client_id ?? null) as string | null,
		kind: parseObservationKind(row.kind) ?? 'other',
		headline: row.headline as string,
		sourceUrl: row.source_url as string,
		observedAt: row.observed_at as string,
		observedByAccountId: row.observed_by_account_id as string
	};
}
