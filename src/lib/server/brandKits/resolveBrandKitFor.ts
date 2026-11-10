import { loadBrandKit } from './loadBrandKit';
import { resolveBrand } from '$lib/brand/resolution/resolveBrand';
import type { Medium } from '$lib/brand/mediums/mediumDefinition';
import type { ResolvedBrand } from '$lib/brand/resolution/resolvedBrand';
import type { SupabaseClient } from '@supabase/supabase-js';

/** The organisation's brand as it holds for one medium: what is decided there, and what is not yet. */
export async function resolveBrandKitFor(
	supabase: SupabaseClient,
	organisationId: string,
	medium: Medium
): Promise<ResolvedBrand> {
	const kit = await loadBrandKit(supabase, organisationId);
	return resolveBrand(kit.decisions, kit.catalogue, medium);
}
