import type { SupabaseClient } from '@supabase/supabase-js';
import { isSchemaNotYetMigrated } from '$lib/server/schema/schemaNotYetMigrated';
import { literalInLike } from '$lib/server/schema/likePattern';
import { parsePremisesRecord, premisesColumns, type Premises } from './premisesRecord';
import type { PremisesSource } from '$lib/data/foodHygieneRules';

/**
 * How a list of a territory's premises is narrowed: an empty sector or category and a null source or date keep everything.
 * arrivedSince keeps the premises that arrived on or after that moment, once their ground had been loaded: a first load is no arrival.
 */
export type PremisesNarrowing = { sector: string; source: PremisesSource | null; category: string; arrivedSince: string | null };

/** The premises one answer lists, and how many fit the narrowing in all. */
export type PremisesMatched = { premises: Premises[]; matchedCount: number };

/** As many premises as one answer to a Claude lists: a territory holds thousands, and an answer has to fit one reply. */
export const mostPremisesListed = 100;

const noneMatched: PremisesMatched = { premises: [], matchedCount: 0 };

/**
 * The premises still trading in the patch's outcodes that fit the narrowing, the newest first, narrowed by the database itself.
 * Which premises arrived later is marked by migration 0251, and until it has run none has.
 */
export async function listPremisesMatching(supabase: SupabaseClient, outcodes: string[], narrowing: PremisesNarrowing): Promise<PremisesMatched> {
	if (outcodes.length === 0) return noneMatched;
	const { sector, source, category, arrivedSince } = narrowing;
	const stillTrading = supabase.from('premises').select(premisesColumns, { count: 'exact' }).in('outcode', outcodes).eq('is_gone', false);
	const inSector = sector === '' ? stillTrading : stillTrading.eq('sector', sector);
	const fromSource = source === null ? inSector : inSector.eq('source', source);
	const ofCategory = category === '' ? fromSource : fromSource.ilike('category', `%${literalInLike(category)}%`);
	const arrived = arrivedSince === null ? ofCategory : ofCategory.eq('is_later_arrival', true).gte('first_seen_at', arrivedSince);
	const { data, error, count } = await arrived.order('first_seen_at', { ascending: false }).order('business_name').order('id').limit(mostPremisesListed);
	if (error !== null && isSchemaNotYetMigrated(error)) return noneMatched;
	if (error) throw error;
	const premises = data.map(parsePremisesRecord);
	return { premises, matchedCount: count ?? premises.length };
}
