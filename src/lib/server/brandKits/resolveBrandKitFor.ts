import { loadHeldBrandKit } from './loadHeldBrandKit';
import { resolveBrand } from '$lib/brand/resolution/resolveBrand';
import type { BrandHolder } from './brandHolder';
import type { Medium } from '$lib/brand/mediums/mediumDefinition';
import type { ResolvedBrand } from '$lib/brand/resolution/resolvedBrand';
import type { SupabaseClient } from '@supabase/supabase-js';

/** The holder's brand as it holds for one medium: what is decided there, and what is not yet. */
export async function resolveBrandKitFor(supabase: SupabaseClient, holder: BrandHolder, medium: Medium): Promise<ResolvedBrand> {
	const kit = await loadHeldBrandKit(supabase, holder);
	return resolveBrand(kit.decisions, kit.catalogue, medium);
}
