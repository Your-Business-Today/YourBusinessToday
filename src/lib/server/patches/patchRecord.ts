import { parseRadiusMiles, type RadiusMiles } from '$lib/data/mapRadii';

export type Patch = {
	id: string;
	name: string;
	centrePostcode: string;
	radiusMiles: RadiusMiles;
	sicCodes: string[];
	outcodes: string[];
	ownerAccountId: string | null;
	createdAt: string;
};

export const patchColumns =
	'id, name, centre_postcode, radius_miles, sic_codes, owner_account_id, created_at, patch_outcodes(outcode)';

type OutcodeRow = { outcode: string };

export function parsePatchRecord(row: Record<string, unknown>): Patch {
	const outcodeRows = (row.patch_outcodes ?? []) as OutcodeRow[];
	return {
		id: row.id as string,
		name: row.name as string,
		centrePostcode: row.centre_postcode as string,
		radiusMiles: parseRadiusMiles(row.radius_miles),
		sicCodes: (row.sic_codes ?? []) as string[],
		outcodes: outcodeRows.map((outcodeRow) => outcodeRow.outcode).sort(),
		ownerAccountId: (row.owner_account_id ?? null) as string | null,
		createdAt: row.created_at as string
	};
}
