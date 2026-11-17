import { validateRecordId } from '$lib/data/isUuid';
import { validateWatchedThing } from './validateWatchedThing';
import { watchedThingColumns, watchedThingOf, type WatchedThingRow } from './watchedThingRecord';
import type { WatchedThing } from '$lib/data/news/watchListRules';
import type { SupabaseClient } from '@supabase/supabase-js';

const watchListTable = 'news_watch_list';
const uniqueViolation = '23505';

/** Who adds a thing to which organisation's list. */
export type WatchListKeeper = { organisationId: string; addedBy: string };

export const watchListRefusals = {
	alreadyWatched: 'That is already on the watch list.',
	notOnTheList: 'Nothing on this organisation’s watch list has that id; list it first for the ids.'
} as const;

/** Everything the organisation watches, by kind and then by value. */
export async function findWatchList(supabase: SupabaseClient, organisationId: string): Promise<WatchedThing[]> {
	const { data, error } = await supabase
		.from(watchListTable)
		.select(watchedThingColumns)
		.eq('organisation_id', organisationId)
		.order('kind')
		.order('value');
	if (error !== null) throw error;
	return (data as unknown as WatchedThingRow[]).map(watchedThingOf);
}

/** Adds the thing to the watch list once its every field fits its column, or says what does not fit. */
export async function addWatchedThing(supabase: SupabaseClient, keeper: WatchListKeeper, input: Record<string, unknown>): Promise<WatchedThing | string> {
	const given = validateWatchedThing(input);
	if (typeof given === 'string') return given;
	const { organisationId, addedBy } = keeper;
	const row = { organisation_id: organisationId, added_by: addedBy, ...given };
	const { data, error } = await supabase.from(watchListTable).insert(row).select(watchedThingColumns).single();
	if (error?.code === uniqueViolation) return watchListRefusals.alreadyWatched;
	if (error !== null) throw error;
	return watchedThingOf(data as unknown as WatchedThingRow);
}

/** Takes the thing off the watch list, or says why nothing was taken off. */
export async function removeWatchedThing(supabase: SupabaseClient, organisationId: string, watchedThingId: string): Promise<WatchedThing | string> {
	const idRefusal = validateRecordId('watched thing', watchedThingId);
	if (idRefusal !== null) return idRefusal;
	const { data, error } = await supabase
		.from(watchListTable)
		.delete()
		.eq('organisation_id', organisationId)
		.eq('id', watchedThingId)
		.select(watchedThingColumns)
		.maybeSingle();
	if (error !== null) throw error;
	if (data === null) return watchListRefusals.notOnTheList;
	return watchedThingOf(data as unknown as WatchedThingRow);
}
