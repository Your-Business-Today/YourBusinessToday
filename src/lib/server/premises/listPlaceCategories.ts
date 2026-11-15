import type { SupabaseClient } from '@supabase/supabase-js';
import { isSchemaNotYetMigrated } from '$lib/server/schema/schemaNotYetMigrated';
import { literalInLike } from '$lib/server/schema/likePattern';

/** A category of trading place a territory holds, named as Overture Maps writes it: how many places trade there, and how many of those list a phone number. */
export type PlaceCategory = { name: string; placeCount: number; withPhoneCount: number };

/** The categories one answer lists, and how many fit the word in all. */
export type PlaceCategoriesMatched = { categories: PlaceCategory[]; matchedCount: number };

/** As many categories as one answer to a Claude lists: a territory holds hundreds, and an answer has to fit one reply. */
export const mostCategoriesListed = 100;

const noneHeld: PlaceCategoriesMatched = { categories: [], matchedCount: 0 };

/** The territory's categories of trading place whose name contains the word, the commonest first, counted by the database; none until its migration has run. */
export async function listPlaceCategories(supabase: SupabaseClient, patchId: string, word: string): Promise<PlaceCategoriesMatched> {
	const held = supabase.rpc('patch_place_categories', { target_patch_id: patchId }, { count: 'exact' });
	const containingWord = word === '' ? held : held.ilike('category', `%${literalInLike(word)}%`);
	const { data, error, count } = await containingWord.order('place_count', { ascending: false }).order('category').limit(mostCategoriesListed);
	if (error !== null && isSchemaNotYetMigrated(error)) return noneHeld;
	if (error) throw error;
	const categories = data.map(parsePlaceCategory);
	return { categories, matchedCount: count ?? categories.length };
}

function parsePlaceCategory(row: Record<string, unknown>): PlaceCategory {
	return { name: row.category as string, placeCount: Number(row.place_count ?? 0), withPhoneCount: Number(row.with_phone_count ?? 0) };
}
