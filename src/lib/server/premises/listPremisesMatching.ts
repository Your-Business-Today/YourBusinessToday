import type { SupabaseClient } from '@supabase/supabase-js';
import { parsePremisesRecord, premisesColumns, type Premises } from './premisesRecord';
import type { PremisesSource } from '$lib/data/foodHygieneRules';

/** How a list of a territory's premises is narrowed: an empty sector or category and a null source or date keep everything. */
export type PremisesNarrowing = { sector: string; source: PremisesSource | null; category: string; firstSeenSince: string | null };

/** The premises one answer lists, and how many fit the narrowing in all. */
export type PremisesMatched = { premises: Premises[]; matchedCount: number };

/** As many premises as one answer to a Claude lists: a territory holds thousands, and an answer has to fit one reply. */
export const mostPremisesListed = 100;

/** The premises still trading in the patch's outcodes that fit the narrowing, the newest first, narrowed by the database itself. */
export async function listPremisesMatching(supabase: SupabaseClient, outcodes: string[], narrowing: PremisesNarrowing): Promise<PremisesMatched> {
	if (outcodes.length === 0) return { premises: [], matchedCount: 0 };
	const { sector, source, category, firstSeenSince } = narrowing;
	const stillTrading = supabase.from('premises').select(premisesColumns, { count: 'exact' }).in('outcode', outcodes).eq('is_gone', false);
	const inSector = sector === '' ? stillTrading : stillTrading.eq('sector', sector);
	const fromSource = source === null ? inSector : inSector.eq('source', source);
	const ofCategory = category === '' ? fromSource : fromSource.ilike('category', `%${literalInLike(category)}%`);
	const seenSince = firstSeenSince === null ? ofCategory : ofCategory.gte('first_seen_at', firstSeenSince);
	const { data, error, count } = await seenSince.order('first_seen_at', { ascending: false }).order('business_name').order('id').limit(mostPremisesListed);
	if (error) throw error;
	const premises = data.map(parsePremisesRecord);
	return { premises, matchedCount: count ?? premises.length };
}

/** The word with the pattern's own wildcards made plain characters, so a category such as hair_salon is matched as written. */
function literalInLike(word: string): string {
	return word.replace(/[\\%_]/g, (wildcard) => `\\${wildcard}`);
}
