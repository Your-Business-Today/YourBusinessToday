import { layerBrandKit } from './layerBrandKit';
import { loadBrandKit, type BrandKit } from './loadBrandKit';
import type { BrandHolder } from './brandHolder';
import type { SupabaseClient } from '@supabase/supabase-js';

/** The kit a holder's brand reads as: an organisation's own, or a product's over its organisation's. */
export async function loadHeldBrandKit(supabase: SupabaseClient, holder: BrandHolder): Promise<BrandKit> {
	const { owner, underlyingOwner } = holder;
	if (underlyingOwner === null) return loadBrandKit(supabase, owner);
	const [product, organisation] = await Promise.all([loadBrandKit(supabase, owner), loadBrandKit(supabase, underlyingOwner)]);
	return layerBrandKit(product, organisation);
}
