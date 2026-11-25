import type { SupabaseClient } from '@supabase/supabase-js';
import { fromPence } from '$lib/data/books/money';
import { describeMonth, monthEnd, monthOfDay, monthStart, validateMonthKey, type MonthKey } from '$lib/data/books/monthKey';
import { directorsLoanJournalOf } from '$lib/data/books/sharing/directorsLoanJournal';
import { directorsLoanPartsOf, type DirectorsLoanPart } from '$lib/data/books/sharing/directorsLoanParts';
import { BooksRefusal, refuseWhen } from './booksRefusal';
import { findLatestClose } from './booksClosing';
import { claimLoanPosting, findLoanPostings, releaseLoanPosting } from './costShareLoanMovedMonths';
import { postJournalSet } from './journalSet';
import { isJournalPosted, prepareStepJournal } from './journalStep';
import { readSharedLedgerUpTo } from './sharedLedgerEntries';

/** What moving a month of a shared cost onto the directors' loans did: each member's part posted, already posted, or with nothing to move. */
export type DirectorsLoanPosting = {
	month: MonthKey;
	journalDate: string;
	posted: DirectorsLoanPart[];
	alreadyPosted: DirectorsLoanPart[];
	empty: DirectorsLoanPart[];
};

/**
 * Moves each part of a shared cost that a member keeps on a director's loan in the month off the costs onto that loan,
 * one journal for each member, dated the month's last day or today while the month runs; never twice for a month, and
 * never into a month the books are closed to.
 */
export async function postDirectorsLoanParts(
	supabase: SupabaseClient,
	organisationId: string,
	today: string,
	request: { costCentreId: unknown; month: unknown }
) {
	refuseWhen(validateMonthKey('month', request.month));
	const month = request.month as MonthKey;
	const monthName = describeMonth(month);
	const hasBegun = monthStart(month) <= today;
	if (!hasBegun) throw new BooksRefusal(`${monthName} has not begun; a month is moved onto the director's loan once it has.`);
	await refuseClosedMonth(supabase, organisationId, month);
	const journalDate = monthEnd(month) < today ? monthEnd(month) : today;
	const { entries, shares, costCentres } = await readSharedLedgerUpTo(supabase, organisationId, journalDate);
	const share = shares.find((candidate) => candidate.costCentreId === request.costCentreId);
	if (share === undefined) throw new BooksRefusal(`Cost centre ${request.costCentreId} is not a shared cost; read_cost_shares lists them.`);
	const label = costCentres.find((costCentre) => costCentre.id === share.costCentreId)?.label ?? 'a shared cost';
	const parts = directorsLoanPartsOf(entries, share, month);
	const isAnyKeptOnLoan = parts.length > 0;
	if (!isAnyKeptOnLoan) throw new BooksRefusal(`No member keeps its part of ${label} on a director's loan in ${monthName}.`);
	const postings = await findLoanPostings(supabase, organisationId);
	const isPosted = (part: DirectorsLoanPart) => postings.some((posting) => posting.memberId === part.memberId && posting.month === month);
	const alreadyPosted = parts.filter(isPosted);
	const empty = parts.filter((part) => !isPosted(part) && part.pence === 0);
	const toPost = parts.filter((part) => !isPosted(part) && part.pence > 0);
	for (const part of toPost) await postPart(supabase, organisationId, directorsLoanJournalOf(part, label, month, journalDate), part, month);
	return { month, journalDate, posted: toPost, alreadyPosted, empty } satisfies DirectorsLoanPosting;
}

async function refuseClosedMonth(supabase: SupabaseClient, organisationId: string, month: MonthKey): Promise<void> {
	const latest = await findLatestClose(supabase, organisationId);
	if (latest === null) return;
	const closedTo = monthOfDay(latest.closed_to_month);
	const isClosed = month <= closedTo;
	const refusal = `The books are closed to ${describeMonth(closedTo)}, so ${describeMonth(month)} cannot take a journal.`;
	if (isClosed) throw new BooksRefusal(refusal);
}

type LoanJournal = ReturnType<typeof directorsLoanJournalOf>;

async function postPart(supabase: SupabaseClient, organisationId: string, fields: LoanJournal, part: DirectorsLoanPart, month: MonthKey): Promise<void> {
	const journal = await prepareStepJournal(supabase, organisationId, fields);
	const posting = { memberId: part.memberId, month, journalId: journal.id, amount: fromPence(part.pence) };
	const isClaimed = await claimLoanPosting(supabase, organisationId, posting);
	const refusal = `${describeMonth(month)} was moved onto the director's loan a moment ago; read_cost_shares shows it.`;
	if (!isClaimed) throw new BooksRefusal(refusal);
	const words = { move: `the journal "${journal.description}" was posted`, whereItStands: 'read_cost_shares says which months have moved' };
	await postJournalSet(supabase, organisationId, [journal], words).catch(async (failure) => {
		const isPostedAfterAll = await isJournalPosted(supabase, organisationId, journal.id);
		if (!isPostedAfterAll) await releaseLoanPosting(supabase, organisationId, journal.id);
		throw failure;
	});
}
