import type { SupabaseClient } from '@supabase/supabase-js';
import { accountsOutcomes, readMethods, type AccountsReading } from '$lib/data/accountsReadingRules';
import { accountsDocumentPage, isCompanyDocumentPage } from './accountsDocumentPage';
import { emptyReading } from './readLatestAccounts';
import { formatBritishDate } from '$lib/data/britishDate';
import { getAccountsReading, saveAccountsReading } from '$lib/server/register/accountsReadingWriter';
import { getLatestAccountsFiling, type AccountsFilingEntry } from './latestAccountsFiling';
import { isHeldAsTaggedAccounts } from './accountsDocument';
import { pdfReadingFieldRules, type PdfReadingSent } from '$lib/data/pdfReadingRules';

export const taggedFiguresStand = 'Those accounts carry tagged figures, and a reading from the tagged figures stands: read_company_accounts gives it.';
export const noAccountsToRead = 'That company has filed no accounts, so there is no balance sheet to read.';

/** A PDF balance sheet read by a staff member's Claude, kept through the readings door once it is checked against the company's latest accounts. */
export async function saveClaudeReading(supabase: SupabaseClient, companyNumber: string, sent: PdfReadingSent, readerAccountId: string): Promise<AccountsReading | string> {
	if (!isCompanyDocumentPage(sent.page, companyNumber)) return pdfReadingFieldRules.page;
	const filing = await getLatestAccountsFiling(companyNumber);
	if (filing === null) return noAccountsToRead;
	const isLatestDate = filing.madeUpTo === sent.madeUpTo;
	if (!isLatestDate) return `madeUpTo must be ${filing.madeUpTo}, the date of the company's latest accounts: ${formatBritishDate(filing.madeUpTo)}.`;
	const isTagged = await hasTaggedFigures(supabase, companyNumber, filing);
	if (isTagged) return taggedFiguresStand;
	const reading = readingOf(companyNumber, filing, sent, readerAccountId);
	const refusal = await saveAccountsReading(supabase, reading);
	return refusal ?? reading;
}

async function hasTaggedFigures(supabase: SupabaseClient, companyNumber: string, filing: AccountsFilingEntry): Promise<boolean> {
	const stored = await getAccountsReading(supabase, companyNumber);
	const isStoredTagged = stored !== null && stored.readMethod === readMethods.taggedFigures && stored.madeUpTo === filing.madeUpTo;
	if (isStoredTagged) return true;
	return filing.documentId !== '' && (await isHeldAsTaggedAccounts(filing.documentId));
}

function readingOf(companyNumber: string, filing: AccountsFilingEntry, sent: PdfReadingSent, readerAccountId: string): AccountsReading {
	return {
		...emptyReading(companyNumber, accountsOutcomes.cashStated, readMethods.readByClaude),
		accountsType: filing.accountsType,
		madeUpTo: filing.madeUpTo,
		transactionId: filing.transactionId,
		cash: sent.cash,
		currentAssets: sent.currentAssets,
		documentUrl: accountsDocumentPage(companyNumber, filing.transactionId),
		readPage: sent.page,
		readByAccountId: readerAccountId
	};
}
