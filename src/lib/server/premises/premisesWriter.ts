import type { SupabaseClient } from '@supabase/supabase-js';
import { premisesSources } from '$lib/data/foodHygieneRules';
import type { Establishment } from '$lib/server/foodHygiene/establishmentRecord';
import type { FoodAuthority } from '$lib/server/foodHygiene/foodAuthorityRecord';

const rowsPerBatch = 500;

/** Writes the establishments as premises rows in batches, and says how many were written. */
export async function upsertPremises(supabase: SupabaseClient, establishments: Establishment[], seenAt: string): Promise<number> {
	let written = 0;
	for (let start = 0; start < establishments.length; start += rowsPerBatch) {
		const rows = establishments.slice(start, start + rowsPerBatch).map(premisesRowOf);
		const { data, error } = await supabase.rpc('upsert_premises', { rows, seen_at: seenAt });
		if (error) throw error;
		written += Number(data ?? 0);
	}
	return written;
}

/** Only after an authority's whole file was read: whatever it no longer lists has gone. */
export async function markPremisesGone(supabase: SupabaseClient, authorityCode: string, seenAt: string): Promise<number> {
	const { data, error } = await supabase.rpc('mark_premises_gone', {
		swept_authority_code: authorityCode,
		swept_source: premisesSources.foodHygiene,
		seen_at: seenAt
	});
	if (error) throw error;
	return Number(data ?? 0);
}

export async function recordAuthoritySweep(supabase: SupabaseClient, authority: FoodAuthority, premisesCount: number, sweptAt: string): Promise<void> {
	const { error } = await supabase.from('food_hygiene_authorities').upsert(
		{ code: authority.code, name: authority.name, file_name: authority.fileName, published_at: authority.publishedOn, swept_at: sweptAt, premises_count: premisesCount },
		{ onConflict: 'code' }
	);
	if (error) throw error;
}

function premisesRowOf(establishment: Establishment): Record<string, unknown> {
	return {
		source: premisesSources.foodHygiene,
		source_id: establishment.fhrsId,
		business_name: establishment.businessName,
		business_type: establishment.businessType,
		address: establishment.address,
		postcode: establishment.postcode,
		sector: establishment.sector,
		outcode: establishment.outcode,
		latitude: establishment.latitude,
		longitude: establishment.longitude,
		rating_value: establishment.ratingValue,
		rating_date: establishment.ratingDate,
		is_new_rating_pending: establishment.isNewRatingPending,
		authority_code: establishment.authorityCode,
		source_url: establishment.sourceUrl
	};
}
