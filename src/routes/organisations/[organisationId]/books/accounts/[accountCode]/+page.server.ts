import { error } from '@sveltejs/kit';
import { askedPeriodOf } from '$lib/data/books/page/booksPeriodQuery';
import { accountEntryRows } from '$lib/data/books/page/accountEntryRows';
import { booksPathOver } from '$lib/data/books/page/booksPaths';
import { ukClockAt } from '$lib/data/ukClock';
import { readAccountStatement } from '$lib/server/books/accountStatement';
import { BooksRefusal } from '$lib/server/books/booksRefusal';
import type { PageServerLoad } from './$types';

const refusedStatus = 404;

export const load: PageServerLoad = async ({ locals, parent, params, url }) => {
	const { booksOrganisation } = await parent();
	const asked = askedPeriodOf(url.searchParams);
	const request = { accountCode: params.accountCode, periodStart: asked.periodStart, periodEnd: asked.periodEnd ?? ukClockAt(new Date()).date };
	const statement = await readAccountStatement(locals.supabase, booksOrganisation.id, request).catch(refusedAsNotFound);
	const { account, period } = statement;
	return {
		account,
		period,
		rows: accountEntryRows(statement),
		closingBalance: statement.closingBalance,
		booksHref: booksPathOver(booksOrganisation.id, period)
	};
};

function refusedAsNotFound(failure: unknown): never {
	if (failure instanceof BooksRefusal) error(refusedStatus, failure.message);
	throw failure;
}
