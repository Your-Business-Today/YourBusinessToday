import { parseAreaEventKind } from '$lib/data/areaEventKindOrder';
import type { AreaEvent } from '$lib/data/areaEvent';

export const areaEventColumns =
	'id, outcode, sector, patch_id, kind, company_number, sighting_id, client_id, detail, source_url, happened_at, actor_account_id, created_at';

/** One area_events row; null when its kind is one this build does not know yet. */
export function parseAreaEventRow(row: Record<string, unknown>): AreaEvent | null {
	const kind = parseAreaEventKind(row.kind);
	if (kind === null) return null;
	return {
		id: row.id as string,
		outcode: row.outcode as string,
		sector: (row.sector ?? '') as string,
		patchId: (row.patch_id ?? null) as string | null,
		kind,
		companyNumber: (row.company_number ?? '') as string,
		sightingId: (row.sighting_id ?? null) as string | null,
		clientId: (row.client_id ?? null) as string | null,
		detail: (row.detail ?? '') as string,
		sourceUrl: (row.source_url ?? '') as string,
		happenedAt: (row.happened_at ?? null) as string | null,
		actorAccountId: (row.actor_account_id ?? null) as string | null,
		actorName: null,
		createdAt: row.created_at as string
	};
}
