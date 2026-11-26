import type { SupabaseClient } from '@supabase/supabase-js';
import { sittingSeatOf } from '$lib/data/boardroomDirector';
import { monthOfDay, monthStart, validateMonthKey, type MonthKey } from '$lib/data/books/monthKey';
import { closedPartsOf } from '$lib/data/books/sharing/closedParts';
import type { ClosedPart } from '$lib/data/books/sharing/closedMonths';
import { getDirectorsOfOrganisation } from '$lib/server/boardroom/getDirectorsOfOrganisation';
import { BooksRefusal, refuseWhen } from './booksRefusal';
import { BooksClosingTables, findLatestClose } from './booksClosing';
import { readSharedLedgerUpTo } from './sharedLedgerEntries';

/** Who is closing the books: the person's account, the only thing that makes them a director or not. */
export type Closer = { accountId: string };

/** The month the books are now closed to, who closed them, and how many shared cost parts were kept for the months closed. */
export type BooksClosed = { closedTo: MonthKey; closedByName: string; keptPartCount: number };

/**
 * Closes the organisation's books up to the end of a month that has ended, in a sitting director's name, keeping each
 * shared cost's split for every month it closes as it stands today. A close never moves back.
 */
export async function closeBooksToMonth(supabase: SupabaseClient, organisationId: string, month: unknown, closer: Closer, today: string): Promise<BooksClosed> {
	const closingTo = validatedClosingMonth(month, today);
	const seat = sittingSeatOf(await getDirectorsOfOrganisation(supabase, organisationId), closer.accountId);
	if (seat === null) throw new BooksRefusal('Only a sitting director of the organisation closes its books, and you are not named as one.');
	const latest = await findLatestClose(supabase, organisationId);
	const closedFrom = latest === null ? null : monthOfDay(latest.closed_to_month);
	if (closedFrom !== null && closingTo <= closedFrom) throw new BooksRefusal(`The books are already closed to ${closedFrom}; a close never moves back.`);
	const { entries, shares } = await readSharedLedgerUpTo(supabase, organisationId, today);
	const shareIds = new Map(shares.map((share) => [share.costCentreId, share.id]));
	const parts = closedPartsOf(entries, closedFrom, closingTo);
	await keepParts(supabase, organisationId, parts, shareIds);
	const close = { organisation_id: organisationId, closed_to_month: monthStart(closingTo), closed_by_account_id: closer.accountId, closed_by_name: seat.name };
	const { error } = await supabase.from(BooksClosingTables.closes).insert(close);
	if (error !== null) throw error;
	return { closedTo: closingTo, closedByName: seat.name, keptPartCount: parts.length };
}

function validatedClosingMonth(month: unknown, today: string): MonthKey {
	refuseWhen(validateMonthKey('month', month));
	const thisMonth = monthOfDay(today);
	if ((month as MonthKey) >= thisMonth) throw new BooksRefusal(`month must have ended to be closed; ${month} has not, as today is ${today}.`);
	return month as MonthKey;
}

async function keepParts(supabase: SupabaseClient, organisationId: string, parts: ClosedPart[], shareIds: Map<string, string>): Promise<void> {
	if (parts.length === 0) return;
	const rows = parts.map((part) => ({
		organisation_id: organisationId,
		cost_share_id: shareIds.get(part.sharedFromCostCentreId),
		month: monthStart(part.month),
		account_id: part.accountId,
		account_code: part.accountCode,
		account_name: part.accountName,
		account_type: part.accountType,
		cost_centre_id: part.costCentreId,
		debit: part.debit,
		credit: part.credit
	}));
	const conflict = 'cost_share_id,month,account_id,cost_centre_id';
	const { error } = await supabase.from(BooksClosingTables.parts).upsert(rows, { onConflict: conflict });
	if (error !== null) throw error;
}
