import { error, fail } from '@sveltejs/kit';
import { requireOrganisationModule } from '$lib/server/auth/requireOrganisationModule';
import { addWatchedThing, findWatchList, removeWatchedThing } from '$lib/server/news/newsWatchList';
import { addTickedSuggestions } from '$lib/server/news/addTickedSuggestions';
import { trimmedText } from '$lib/data/trimmedText';
import type { RequestEvent } from '@sveltejs/kit';
import type { Actions } from './$types';

export const onlyStaffKeepTheWatchList = 'Only Your Business Today staff change what an organisation’s Business News watches.';

const suggestionField = 'suggestion';

async function requireWatchListKeeper({ locals, params }: Pick<RequestEvent, 'locals' | 'params'>) {
	const organisationId = params.organisationId ?? '';
	const { user, isStaff } = await requireOrganisationModule(locals, organisationId, 'news');
	if (!isStaff) error(403, onlyStaffKeepTheWatchList);
	return { organisationId, addedBy: user.id };
}

export const newsWatchListActions = {
	addWatched: async (event) => {
		const keeper = await requireWatchListKeeper(event);
		const formData = Object.fromEntries(await event.request.formData());
		const added = await addWatchedThing(event.locals.supabase, keeper, formData);
		if (typeof added === 'string') return fail(400, { message: added });
		return { message: `Now watching ${added.value}.` };
	},
	removeWatched: async (event) => {
		const { organisationId } = await requireWatchListKeeper(event);
		const formData = await event.request.formData();
		const removed = await removeWatchedThing(event.locals.supabase, organisationId, trimmedText(formData.get('watchedThingId')));
		if (typeof removed === 'string') return fail(400, { message: removed });
		return { message: `No longer watching ${removed.value}.` };
	},
	addSuggested: async (event) => {
		const keeper = await requireWatchListKeeper(event);
		const formData = await event.request.formData();
		const tickedKeys = formData.getAll(suggestionField).map(trimmedText);
		const watchList = await findWatchList(event.locals.supabase, keeper.organisationId);
		const outcome = await addTickedSuggestions(event.locals.supabase, keeper, { watchList, tickedKeys });
		if (outcome.refusal !== null) return fail(400, { message: outcome.refusal });
		return { message: `Now watching ${outcome.addedCount} more.` };
	}
} satisfies Actions;
