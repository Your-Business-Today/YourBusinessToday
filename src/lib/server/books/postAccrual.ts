import type { SupabaseClient } from '@supabase/supabase-js';
import { validateAccrual, type AccrualInput } from '$lib/data/books/periodEndRules';
import { accrualDescription, accrualReversalDescription, accrualReversalLines, accruedCostLines } from '$lib/data/books/periodEndPostings';
import { monthEnd, monthStart, shiftMonth } from '$lib/data/books/monthKey';
import { PeriodEndJournalKinds } from '$lib/data/books/journalKinds';
import { SystemAccounts } from '$lib/data/books/systemAccounts';
import { BooksRefusal, refuseWhen } from './booksRefusal';
import { periodEndTargetRefusal } from './periodEndTargets';
import { withdrawJournal } from './invoiceStatusMoves';
import { postJournal } from './postJournal';
import { findOrOpenSystemAccount } from './systemAccounts';

const oneMonthOn = 1;

/** An accrual as it was posted: on the month's last day, and reversed on the first day of the month after. */
export type PostedAccrual = AccrualInput & { postedOn: string; reversedOn: string };

/**
 * Accrues a cost incurred in the month but not yet billed: debited to its expense account on the month's last day and
 * owed on Accruals (2200, opened when the chart has none), then reversed on the first of the next month, so the bill
 * posts the cost once when it is recorded. When the reversal cannot be posted, the accrual is taken back out, so no
 * accrual is ever left standing without its reversal.
 */
export async function postAccrual(supabase: SupabaseClient, organisationId: string, fields: Record<string, unknown>): Promise<PostedAccrual> {
	const accrual = validateAccrual(fields);
	if (typeof accrual === 'string') throw new BooksRefusal(accrual);
	refuseWhen(await periodEndTargetRefusal(supabase, organisationId, accrual));
	const accrualsAccountId = await findOrOpenSystemAccount(supabase, organisationId, SystemAccounts.accruals);
	const postedOn = monthEnd(accrual.monthKey);
	const accrualJournalId = await postJournal(supabase, organisationId, {
		journalDate: postedOn,
		description: accrualDescription(accrual),
		kind: PeriodEndJournalKinds.accrual,
		lines: accruedCostLines(accrual, accrualsAccountId)
	});
	const reversal = {
		journalDate: monthStart(shiftMonth(accrual.monthKey, oneMonthOn)),
		description: accrualReversalDescription(accrual),
		kind: PeriodEndJournalKinds.accrualReversal,
		reversesJournalId: accrualJournalId,
		lines: accrualReversalLines(accrual, accrualsAccountId)
	};
	await postJournal(supabase, organisationId, reversal).catch(async (failure: unknown) => {
		await withdrawJournal(supabase, organisationId, accrualJournalId);
		throw failure;
	});
	return { ...accrual, postedOn, reversedOn: reversal.journalDate };
}
