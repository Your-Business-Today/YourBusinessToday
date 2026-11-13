import { readBankPage } from '$lib/server/books/bankPage';
import { supabaseServiceClient } from '$lib/server/payments/supabaseServiceClient';
import type { PageServerLoad } from './$types';

/** The layout has already let the person into the organisation's books, so the service client may read its statement lines. */
export const load: PageServerLoad = async ({ parent }) => {
	const { booksOrganisation } = await parent();
	return { bank: await readBankPage(supabaseServiceClient(), booksOrganisation.id) };
};
