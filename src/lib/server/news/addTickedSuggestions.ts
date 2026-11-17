import { addWatchedThing, type WatchListKeeper } from './newsWatchList';
import { readWatchListSuggestions } from './readWatchListSuggestions';
import { watchedThingKey } from '$lib/data/news/watchedThingKey';
import type { WatchedThing } from '$lib/data/news/watchListRules';
import type { SupabaseClient } from '@supabase/supabase-js';

/** The list as it stands and the keys of the suggestions the person ticked. */
export type TickedSuggestions = { watchList: WatchedThing[]; tickedKeys: string[] };

export type TickedSuggestionsOutcome = { addedCount: number; refusal: string | null };

export const nothingTicked = 'Tick at least one suggestion to watch it.';

/** Adds the suggestions that were ticked, read again from the Domain and the register so nothing else is added. */
export async function addTickedSuggestions(
	supabase: SupabaseClient,
	keeper: WatchListKeeper,
	{ watchList, tickedKeys }: TickedSuggestions
): Promise<TickedSuggestionsOutcome> {
	const suggestions = await readWatchListSuggestions(supabase, keeper.organisationId, watchList);
	const ticked = suggestions.filter((suggestion) => tickedKeys.includes(watchedThingKey(suggestion)));
	if (ticked.length === 0) return { addedCount: 0, refusal: nothingTicked };
	let addedCount = 0;
	for (const suggestion of ticked) {
		const added = await addWatchedThing(supabase, keeper, suggestion);
		if (typeof added === 'string') return { addedCount, refusal: added };
		addedCount += 1;
	}
	return { addedCount, refusal: null };
}
