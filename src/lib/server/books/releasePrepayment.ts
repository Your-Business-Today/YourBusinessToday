import type { SupabaseClient } from '@supabase/supabase-js';
import { validatePrepaymentRelease, type PrepaymentReleaseInput } from '$lib/data/books/periodEndRules';
import { monthlyReleases, releaseDescription, releasedShareLines, type MonthlyRelease } from '$lib/data/books/periodEndPostings';
import { monthEnd } from '$lib/data/books/monthKey';
import { PeriodEndJournalKinds } from '$lib/data/books/journalKinds';
import { SystemAccounts } from '$lib/data/books/systemAccounts';
import { BooksRefusal, refuseWhen } from './booksRefusal';
import { periodEndTargetRefusal } from './periodEndTargets';
import { withdrawJournal } from './invoiceStatusMoves';
import { postJournal } from './postJournal';
import { findOrOpenSystemAccount } from './systemAccounts';

/** A prepayment's release as it was posted: each month's share, released at that month's end. */
export type PostedRelease = PrepaymentReleaseInput & { releases: MonthlyRelease[] };

/**
 * Spreads a cost paid up front across the months it covers: one journal at the end of each month, moving that month's
 * share out of Prepayments (1300, opened when the chart has none) into the expense account, within its cost centre.
 * When any month cannot be posted, the months already posted are taken back out, so a release is posted whole or not at all.
 */
export async function releasePrepayment(supabase: SupabaseClient, organisationId: string, fields: Record<string, unknown>): Promise<PostedRelease> {
	const release = validatePrepaymentRelease(fields);
	if (typeof release === 'string') throw new BooksRefusal(release);
	refuseWhen(await periodEndTargetRefusal(supabase, organisationId, release));
	const prepaymentsAccountId = await findOrOpenSystemAccount(supabase, organisationId, SystemAccounts.prepayments);
	const releases = monthlyReleases(release);
	const postedJournalIds: string[] = [];
	try {
		for (const share of releases) postedJournalIds.push(await postShare(supabase, organisationId, release, prepaymentsAccountId, share));
	} catch (failure) {
		for (const journalId of postedJournalIds) await withdrawJournal(supabase, organisationId, journalId);
		throw failure;
	}
	return { ...release, releases };
}

async function postShare(
	supabase: SupabaseClient,
	organisationId: string,
	release: PrepaymentReleaseInput,
	prepaymentsAccountId: string,
	share: MonthlyRelease
): Promise<string> {
	return postJournal(supabase, organisationId, {
		journalDate: monthEnd(share.monthKey),
		description: releaseDescription(release, share.monthKey),
		kind: PeriodEndJournalKinds.prepaymentRelease,
		lines: releasedShareLines(release, prepaymentsAccountId, share.amount)
	});
}
