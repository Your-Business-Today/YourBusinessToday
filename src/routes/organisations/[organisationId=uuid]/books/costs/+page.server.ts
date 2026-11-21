import { readCostRows } from '$lib/server/books/costRows';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals, parent }) => {
	const { booksOrganisation } = await parent();
	return { costs: await readCostRows(locals.supabase, booksOrganisation.id) };
};
