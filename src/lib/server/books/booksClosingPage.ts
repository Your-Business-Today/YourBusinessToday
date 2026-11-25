import { fail } from '@sveltejs/kit';
import type { SupabaseClient } from '@supabase/supabase-js';
import { describeMonth, monthOfDay, shiftMonth } from '$lib/data/books/monthKey';
import { BooksRefusal } from './booksRefusal';
import { findLatestClose } from './booksClosing';
import { closeBooksToMonth, type Closer } from './closeBooks';

const httpBadRequest = 400;
const monthBefore = -1;

/** What the Books page says of the close: where the books stand, and the last month that may be closed now. */
export type BooksClosingStanding = { closedInWords: string; lastClosableMonth: string };

/** Where the organisation's books are closed to, in words, and the latest month that has ended. */
export async function readBooksClosingStanding(supabase: SupabaseClient, organisationId: string, today: string): Promise<BooksClosingStanding> {
	const latest = await findLatestClose(supabase, organisationId);
	const lastClosableMonth = shiftMonth(monthOfDay(today), monthBefore);
	if (latest === null) return { closedInWords: 'No month has been closed yet.', lastClosableMonth };
	const closedTo = describeMonth(monthOfDay(latest.closed_to_month));
	return { closedInWords: `Closed to the end of ${closedTo} by ${latest.closed_by_name}.`, lastClosableMonth };
}

/** The Books page's close: the month from the form, closed in the person's name, or the refusal shown beside the form. */
export async function closeBooksFromForm(supabase: SupabaseClient, organisationId: string, form: FormData, closer: Closer, today: string) {
	try {
		const closed = await closeBooksToMonth(supabase, organisationId, form.get('month'), closer, today);
		return { closingMessage: `Closed to the end of ${describeMonth(closed.closedTo)}.` };
	} catch (failure) {
		if (failure instanceof BooksRefusal) return fail(httpBadRequest, { closingMessage: failure.message });
		throw failure;
	}
}
