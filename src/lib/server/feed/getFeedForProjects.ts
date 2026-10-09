import type { SupabaseClient } from '@supabase/supabase-js';
import { accountNameLookup } from '$lib/data/accountNames';
import { feedScopes, type FeedEvent, type FeedScope } from '$lib/data/feedEvent';
import { getAccountsById } from '$lib/server/accounts/getAccountsById';
import { feedEventColumns, parseFeedEventRow } from './feedEventRecord';

export const feedPageSize = 100;

/** Whose feed, across which projects, and whether only the tasks asked for by them. */
export type FeedRequest = {
	accountId: string;
	projectIds: string[];
	scope: FeedScope;
};

/** The newest events across the projects given, with the names of who made each move. */
export async function getFeedForProjects(supabase: SupabaseClient, request: FeedRequest): Promise<FeedEvent[]> {
	const { projectIds } = request;
	if (projectIds.length === 0) return [];
	const events = await readFeedRows(supabase, request);
	const actorIds = events.flatMap((event) => (event.actorAccountId === null ? [] : [event.actorAccountId]));
	const accounts = await getAccountsById(supabase, actorIds);
	const nameOf = accountNameLookup(accounts);
	return events.map((event) => ({ ...event, actorName: actorNameFor(event, nameOf) }));
}

async function readFeedRows(supabase: SupabaseClient, request: FeedRequest): Promise<FeedEvent[]> {
	const everyEvent = supabase
		.from('project_events')
		.select(feedEventColumns)
		.in('project_id', request.projectIds);
	const scoped =
		request.scope === feedScopes.mine ? everyEvent.eq('for_account_id', request.accountId) : everyEvent;
	const { data, error } = await scoped.order('created_at', { ascending: false }).limit(feedPageSize);
	if (error) throw error;
	return data.flatMap((row: Record<string, unknown>) => {
		const event = parseFeedEventRow(row);
		return event === null ? [] : [event];
	});
}

function actorNameFor(event: FeedEvent, nameOf: (accountId: string) => string): string | null {
	if (event.actorAccountId === null) return null;
	return nameOf(event.actorAccountId);
}
