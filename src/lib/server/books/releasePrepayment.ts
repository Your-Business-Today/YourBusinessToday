import type { SupabaseClient } from '@supabase/supabase-js';
import { validatePrepaymentRelease, type PrepaymentReleaseInput } from '$lib/data/books/periodEndRules';
import { monthlyReleases, releaseDescription, releasedShareLines, type MonthlyRelease } from '$lib/data/books/periodEndPostings';
import { formatPoundsAndPence } from '$lib/data/books/money';
import { monthEnd } from '$lib/data/books/monthKey';
import { PeriodEndJournalKinds } from '$lib/data/books/journalKinds';
import { SystemAccounts } from '$lib/data/books/systemAccounts';
import { BooksRefusal, refuseWhen } from './booksRefusal';
import { periodEndTargetRefusal } from './periodEndTargets';
import { postJournalSet } from './journalSet';
import { prepareStepJournal, type StepJournal } from './journalStep';
import { periodEndWords } from './periodEndSteps';
import { findOrOpenSystemAccount } from './systemAccounts';

/** A prepayment's release as it was posted: each month's share, released at that month's end. */
export type PostedRelease = PrepaymentReleaseInput & { releases: MonthlyRelease[] };

/**
 * Spreads a cost paid up front across the months it covers: one journal at the end of each month, moving that month's
 * share out of Prepayments (1300, opened when the chart has none) into the expense account, within its cost centre.
 * Every month is posted in one step of the database, so a release is posted whole or not at all.
 */
export async function releasePrepayment(supabase: SupabaseClient, organisationId: string, fields: Record<string, unknown>): Promise<PostedRelease> {
	const release = validatePrepaymentRelease(fields);
	if (typeof release === 'string') throw new BooksRefusal(release);
	refuseWhen(await periodEndTargetRefusal(supabase, organisationId, release));
	const prepaymentsAccountId = await findOrOpenSystemAccount(supabase, organisationId, SystemAccounts.prepayments);
	const releases = monthlyReleases(release);
	const journals: StepJournal[] = [];
	for (const share of releases) journals.push(await prepareShare(supabase, organisationId, release, prepaymentsAccountId, share));
	const spread = `the release of ${formatPoundsAndPence(release.amount)} for ${release.description} was posted`;
	await postJournalSet(supabase, organisationId, journals, periodEndWords(spread));
	return { ...release, releases };
}

async function prepareShare(
	supabase: SupabaseClient,
	organisationId: string,
	release: PrepaymentReleaseInput,
	prepaymentsAccountId: string,
	share: MonthlyRelease
): Promise<StepJournal> {
	return prepareStepJournal(supabase, organisationId, {
		journalDate: monthEnd(share.monthKey),
		description: releaseDescription(release, share.monthKey),
		kind: PeriodEndJournalKinds.prepaymentRelease,
		lines: releasedShareLines(release, prepaymentsAccountId, share.amount)
	});
}
