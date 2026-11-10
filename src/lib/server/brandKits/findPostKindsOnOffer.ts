import { postKindsOnOfferOf, type PostKindsOnOffer } from '$lib/brand/postKinds/postKinds';
import { resolveBrandKitFor } from './resolveBrandKitFor';
import type { Medium } from '$lib/brand/mediums/mediumDefinition';
import type { SupabaseClient } from '@supabase/supabase-js';

/** The kinds of post the organisation's brand keeps for one medium, or the starter list while it keeps none. */
export async function findPostKindsOnOffer(supabase: SupabaseClient, organisationId: string, medium: Medium): Promise<PostKindsOnOffer> {
	const brand = await resolveBrandKitFor(supabase, organisationId, medium);
	return postKindsOnOfferOf(brand);
}
