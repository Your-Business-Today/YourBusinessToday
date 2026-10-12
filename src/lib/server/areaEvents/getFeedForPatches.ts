import type { SupabaseClient } from '@supabase/supabase-js';
import { accountNameLookup } from '$lib/data/accountNames';
import { areaEventColumns, parseAreaEventRow } from './areaEventRecord';
import { getAccountsById } from '$lib/server/accounts/getAccountsById';
import type { AreaEvent } from '$lib/data/areaEvent';
import type { AreaEventKind } from '$lib/data/areaEventKind';

export const areaFeedPageSize = 100;

/** Which ground, and how narrowed: the outcodes of the patches in view, one kind, and a date to start from. */
export type AreaFeedRequest = { outcodes: string[]; kind: AreaEventKind | null; since: string | null };

/** The newest events across the outcodes given, with the names of who made each. */
export async function getFeedForPatches(supabase: SupabaseClient, request: AreaFeedRequest): Promise<AreaEvent[]> {
	const { outcodes } = request;
	if (outcodes.length === 0) return [];
	const events = await readRows(supabase, request);
	const actorIds = events.flatMap((event) => (event.actorAccountId === null ? [] : [event.actorAccountId]));
	const nameOf = accountNameLookup(await getAccountsById(supabase, actorIds));
	return events.map((event) => ({ ...event, actorName: event.actorAccountId === null ? null : nameOf(event.actorAccountId) }));
}

async function readRows(supabase: SupabaseClient, request: AreaFeedRequest): Promise<AreaEvent[]> {
	let query = supabase.from('area_events').select(areaEventColumns).in('outcode', [...new Set(request.outcodes)]);
	if (request.kind !== null) query = query.eq('kind', request.kind);
	if (request.since !== null) query = query.gte('created_at', request.since);
	const { data, error } = await query.order('created_at', { ascending: false }).limit(areaFeedPageSize);
	if (error) throw error;
	return data.flatMap((row: Record<string, unknown>) => {
		const event = parseAreaEventRow(row);
		return event === null ? [] : [event];
	});
}
