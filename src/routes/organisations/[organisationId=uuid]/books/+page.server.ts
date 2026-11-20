import { askedPeriodOf } from '$lib/data/books/page/booksPeriodQuery';
import { accountEntriesPathOf } from '$lib/data/books/page/booksPaths';
import { booksStatementsOf } from '$lib/data/books/page/booksStatements';
import type { EntriesLinker } from '$lib/data/books/page/statementRows';
import { ukClockAt } from '$lib/data/ukClock';
import { readBooksReports } from '$lib/server/books/booksPageReports';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals, parent, url }) => {
	const { booksOrganisation } = await parent();
	const asked = askedPeriodOf(url.searchParams);
	const today = ukClockAt(new Date()).date;
	const reports = await readBooksReports(locals.supabase, booksOrganisation.id, asked, today);
	if (typeof reports === 'string') return { asked, period: null, statements: [], refusal: reports };
	const linkEntries: EntriesLinker = (accountCode, span) => accountEntriesPathOf(booksOrganisation.id, accountCode, span);
	return { asked, period: reports.period, statements: booksStatementsOf(reports, linkEntries), refusal: null };
};
