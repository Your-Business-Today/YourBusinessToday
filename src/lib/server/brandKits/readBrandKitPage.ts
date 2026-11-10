import { brandKitPageOf, type BrandKitPage } from '$lib/brand/projections/brandKitPage';
import { everywherePath, type Medium } from '$lib/brand/mediums/mediumDefinition';
import { findMedium } from '$lib/brand/mediums/mediumCatalogue';
import { loadBrandKit } from './loadBrandKit';
import { resolveBrand } from '$lib/brand/resolution/resolveBrand';
import type { SupabaseClient } from '@supabase/supabase-js';

const everywhere = findMedium(everywherePath) as Medium;

/** The organisation's brand kit as its page shows it, read as the kit holds everywhere. */
export async function readBrandKitPage(supabase: SupabaseClient, organisationId: string): Promise<BrandKitPage> {
	const { catalogue, decisions } = await loadBrandKit(supabase, organisationId);
	const brand = resolveBrand(decisions, catalogue, everywhere);
	return brandKitPageOf({ brand, catalogue, decisions });
}
