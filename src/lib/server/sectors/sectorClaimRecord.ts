/** Who holds a sector of a patch, and since when. */
export type SectorClaim = { patchId: string; sector: string; claimedByAccountId: string; claimedAt: string };

export const sectorClaimColumns = 'patch_id, sector, claimed_by_account_id, claimed_at';

export function parseSectorClaimRecord(row: Record<string, unknown>): SectorClaim {
	return {
		patchId: row.patch_id as string,
		sector: row.sector as string,
		claimedByAccountId: row.claimed_by_account_id as string,
		claimedAt: row.claimed_at as string
	};
}
