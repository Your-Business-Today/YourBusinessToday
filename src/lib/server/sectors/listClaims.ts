import type { SupabaseClient } from '@supabase/supabase-js';
import { parseSectorClaimRecord, sectorClaimColumns, type SectorClaim } from './sectorClaimRecord';

export async function listClaimsForPatch(supabase: SupabaseClient, patchId: string): Promise<SectorClaim[]> {
	const { data, error } = await supabase.from('sector_claims').select(sectorClaimColumns).eq('patch_id', patchId);
	if (error) throw error;
	return data.map(parseSectorClaimRecord);
}

export async function getClaim(supabase: SupabaseClient, patchId: string, sector: string): Promise<SectorClaim | null> {
	const { data, error } = await supabase
		.from('sector_claims')
		.select(sectorClaimColumns)
		.eq('patch_id', patchId)
		.eq('sector', sector)
		.maybeSingle();
	if (error) throw error;
	if (data === null) return null;
	return parseSectorClaimRecord(data);
}
