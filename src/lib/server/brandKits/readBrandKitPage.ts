import { brandKitPageOf, type BrandKitPage } from '$lib/brand/projections/brandKitPage';
import { everywherePath, type Medium } from '$lib/brand/mediums/mediumDefinition';
import { findMedium } from '$lib/brand/mediums/mediumCatalogue';
import { loadHeldBrandKit } from './loadHeldBrandKit';
import { resolveBrand } from '$lib/brand/resolution/resolveBrand';
import type { BrandHolder } from './brandHolder';
import type { SupabaseClient } from '@supabase/supabase-js';

const everywhere = findMedium(everywherePath) as Medium;

/** A brand kit as its page shows it, read as the kit holds everywhere. */
export async function readBrandKitPage(supabase: SupabaseClient, holder: BrandHolder): Promise<BrandKitPage> {
	const { catalogue, decisions } = await loadHeldBrandKit(supabase, holder);
	const brand = resolveBrand(decisions, catalogue, everywhere);
	return brandKitPageOf({ brand, catalogue, decisions });
}
