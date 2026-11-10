import { accountNameLookup } from '$lib/data/accountNames';
import { findBrandSummary } from '$lib/server/brandKits/keepBrandSummary';
import { getAccountsById } from '$lib/server/accounts/getAccountsById';
import { libraryActions } from './libraryActions';
import { readKeptLibrary } from '$lib/server/brandLibrary/findLibraryItems';
import { signLibraryViewLinks } from '$lib/server/brandLibrary/signLibraryViewLinks';
import type { PageServerLoad } from './$types';

const isoDateLength = 10;

export const load: PageServerLoad = async ({ locals, params, parent }) => {
	await parent();
	const [summary, library] = await Promise.all([
		findBrandSummary(locals.supabase, params.organisationId),
		readKeptLibrary(locals.supabase, params.organisationId)
	]);
	const addedByIds = library.items.flatMap((item) => (item.addedBy === null ? [] : [item.addedBy]));
	const [viewable, people] = await Promise.all([
		signLibraryViewLinks(locals.supabase, library.items),
		getAccountsById(locals.supabase, addedByIds)
	]);
	const nameOf = accountNameLookup(people);
	const items = viewable.map((item) => ({ ...item, addedByName: nameOf(item.addedBy ?? '') }));
	const today = new Date().toISOString().slice(0, isoDateLength);
	return { hasBrand: summary !== null, items, keptCount: library.keptCount, today };
};

export const actions = libraryActions;
