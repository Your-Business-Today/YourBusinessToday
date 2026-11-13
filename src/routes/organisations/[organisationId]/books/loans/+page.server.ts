import { ukClockAt } from '$lib/data/ukClock';
import { readLoanRows } from '$lib/server/books/loansPage';
import { supabaseServiceClient } from '$lib/server/payments/supabaseServiceClient';
import type { PageServerLoad } from './$types';

/** The layout has already let the person into the organisation's books, so the service client may read its loan accounts. */
export const load: PageServerLoad = async ({ parent }) => {
	const { booksOrganisation } = await parent();
	const today = ukClockAt(new Date()).date;
	return { loans: await readLoanRows(supabaseServiceClient(), booksOrganisation.id, today) };
};
