import { ukClockAt } from '$lib/data/ukClock';
import { invoicesTabCookie, rememberedInvoicesTab } from '$lib/data/books/page/invoicesTab';
import { readInvoicesPage } from '$lib/server/books/invoicesPage';
import { supabaseServiceClient } from '$lib/server/payments/supabaseServiceClient';
import type { PageServerLoad } from './$types';

/** The layout has already let the person into the organisation's books, so the service client may read its sendings and schedules. */
export const load: PageServerLoad = async ({ locals, parent, cookies }) => {
	const { booksOrganisation } = await parent();
	const today = ukClockAt(new Date()).date;
	const clients = { asPerson: locals.supabase, afterAccessCheck: supabaseServiceClient() };
	const page = await readInvoicesPage(clients, booksOrganisation.id, today);
	return { page, rememberedTab: rememberedInvoicesTab(cookies.get(invoicesTabCookie)) };
};
