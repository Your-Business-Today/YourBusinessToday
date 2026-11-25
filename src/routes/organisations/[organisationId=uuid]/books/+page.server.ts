import { askedPeriodOf } from '$lib/data/books/page/booksPeriodQuery';
import { accountEntriesPathOf } from '$lib/data/books/page/booksPaths';
import { booksStatementsOf } from '$lib/data/books/page/booksStatements';
import type { EntriesLinker } from '$lib/data/books/page/statementRows';
import { ukClockAt } from '$lib/data/ukClock';
import { requireOrganisationModule } from '$lib/server/auth/requireOrganisationModule';
import { readBooksReports } from '$lib/server/books/booksPageReports';
import { closeBooksFromForm, readBooksClosingStanding } from '$lib/server/books/booksClosingPage';
import { supabaseServiceClient } from '$lib/server/payments/supabaseServiceClient';
import type { Actions, PageServerLoad } from './$types';

/** The layout has already let the person into the organisation's books, so the service client may read its shared costs and closes. */
export const load: PageServerLoad = async ({ parent, url }) => {
	const { booksOrganisation } = await parent();
	const asked = askedPeriodOf(url.searchParams);
	const today = ukClockAt(new Date()).date;
	const supabase = supabaseServiceClient();
	const [reports, closing] = await Promise.all([
		readBooksReports(supabase, booksOrganisation.id, asked, today),
		readBooksClosingStanding(supabase, booksOrganisation.id, today)
	]);
	if (typeof reports === 'string') return { asked, period: null, statements: [], refusal: reports, closing };
	const linkEntries: EntriesLinker = (accountCode, span) => accountEntriesPathOf(booksOrganisation.id, accountCode, span);
	return { asked, period: reports.period, statements: booksStatementsOf(reports, linkEntries), refusal: null, closing };
};

export const actions: Actions = {
	closeMonth: async ({ locals, params, request }) => {
		const access = await requireOrganisationModule(locals, params.organisationId, 'books');
		const today = ukClockAt(new Date()).date;
		const closer = { accountId: access.user.id };
		return closeBooksFromForm(supabaseServiceClient(), access.organisation.id, await request.formData(), closer, today);
	}
};
