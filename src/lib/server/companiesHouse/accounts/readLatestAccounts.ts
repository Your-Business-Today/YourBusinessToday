import { accountsDocumentPage } from './accountsDocumentPage';
import { accountsOutcomes, readMethods, type AccountsOutcome, type AccountsReading, type ReadMethod } from '$lib/data/accountsReadingRules';
import { getLatestAccountsFiling, type AccountsFilingEntry } from './latestAccountsFiling';
import { isHeldAsTaggedAccounts, readTaggedAccounts } from './accountsDocument';
import { readCurrentAssets, readFiledFigures } from './readFiledFigures';

const dormantAccountsType = 'dormant';

/** A company's latest accounts, read in at most three calls; the stored reading stands while no newer accounts are filed. */
export async function readLatestAccounts(companyNumber: string, stored: AccountsReading | null): Promise<AccountsReading> {
	const filing = await getLatestAccountsFiling(companyNumber);
	if (filing === null) return emptyReading(companyNumber, accountsOutcomes.noAccounts, readMethods.filingHistory);
	if (stored !== null && isSameFiling(stored, filing)) return stored;
	if (filing.accountsType === dormantAccountsType) return readingOfFiling(companyNumber, filing, accountsOutcomes.dormant);
	const isTagged = filing.documentId !== '' && (await isHeldAsTaggedAccounts(filing.documentId));
	if (!isTagged) return readingOfFiling(companyNumber, filing, accountsOutcomes.pdfOnly);
	return readTaggedFiling(companyNumber, filing);
}

/** The same filing by its transaction, or, for a reading the daily sweep made without one, by its made-up date. */
function isSameFiling(stored: AccountsReading, filing: AccountsFilingEntry): boolean {
	if (stored.transactionId !== '') return stored.transactionId === filing.transactionId;
	return filing.madeUpTo !== '' && stored.madeUpTo === filing.madeUpTo;
}

async function readTaggedFiling(companyNumber: string, filing: AccountsFilingEntry): Promise<AccountsReading> {
	const document = await readTaggedAccounts(filing.documentId);
	const page = accountsDocumentPage(companyNumber, filing.transactionId);
	const figures = readFiledFigures(document, filing.madeUpTo, page);
	const outcome = figures.cash === null ? accountsOutcomes.cashNotStated : accountsOutcomes.cashStated;
	return {
		...readingOfFiling(companyNumber, filing, outcome),
		readMethod: readMethods.taggedFigures,
		cash: figures.cash,
		currentAssets: readCurrentAssets(document, filing.madeUpTo),
		netAssets: figures.netAssets,
		creditors: figures.creditors,
		averageEmployees: figures.averageEmployees
	};
}

function readingOfFiling(companyNumber: string, filing: AccountsFilingEntry, outcome: AccountsOutcome): AccountsReading {
	return {
		...emptyReading(companyNumber, outcome, readMethods.filingHistory),
		accountsType: filing.accountsType,
		madeUpTo: filing.madeUpTo === '' ? null : filing.madeUpTo,
		transactionId: filing.transactionId,
		documentUrl: accountsDocumentPage(companyNumber, filing.transactionId)
	};
}

export function emptyReading(companyNumber: string, outcome: AccountsOutcome, readMethod: ReadMethod): AccountsReading {
	return {
		companyNumber,
		outcome,
		readMethod,
		accountsType: '',
		madeUpTo: null,
		transactionId: '',
		cash: null,
		currentAssets: null,
		netAssets: null,
		creditors: null,
		averageEmployees: null,
		documentUrl: '',
		readPage: '',
		readByAccountId: null,
		readAt: new Date().toISOString()
	};
}
