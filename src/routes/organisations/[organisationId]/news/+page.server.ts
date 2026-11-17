import { findWatchList } from '$lib/server/news/newsWatchList';
import { readWatchListSuggestions } from '$lib/server/news/readWatchListSuggestions';
import { newsWatchListActions } from './newsWatchListActions';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals, params, parent }) => {
	const { canKeepWatchList } = await parent();
	const watchList = await findWatchList(locals.supabase, params.organisationId);
	if (!canKeepWatchList) return { watchList, suggestions: [] };
	const suggestions = await readWatchListSuggestions(locals.supabase, params.organisationId, watchList);
	return { watchList, suggestions };
};

export const actions = newsWatchListActions;
