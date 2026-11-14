import { largestFigure, mostEmployees } from './filedFigures';
import { validateCompanyNumber } from './prospectRules';

/** What a company's latest accounts say about its cash, one of five. */
export const accountsOutcomes = {
	cashStated: 'cash_stated',
	cashNotStated: 'cash_not_stated',
	dormant: 'dormant',
	noAccounts: 'no_accounts',
	pdfOnly: 'pdf_only'
} as const;
export type AccountsOutcome = (typeof accountsOutcomes)[keyof typeof accountsOutcomes];

/** How a reading's figures were got. */
export const readMethods = { taggedFigures: 'tagged_figures', filingHistory: 'filing_history', readByClaude: 'read_by_claude' } as const;
export type ReadMethod = (typeof readMethods)[keyof typeof readMethods];

/** The column limits of company_accounts_readings (0230), stated once for the door and the migration to agree on. */
export const accountsReadingLimits = { accountsType: 60, transactionId: 60, link: 2000 };

/** One reading of a company's latest accounts, as company_accounts_readings keeps it. */
export type AccountsReading = {
	companyNumber: string;
	outcome: AccountsOutcome;
	readMethod: ReadMethod;
	accountsType: string;
	madeUpTo: string | null;
	transactionId: string;
	cash: number | null;
	currentAssets: number | null;
	netAssets: number | null;
	creditors: number | null;
	averageEmployees: number | null;
	documentUrl: string;
	readPage: string;
	readByAccountId: string | null;
	readAt: string;
};

/** Why the reading cannot be stored as it stands, naming the field and the limit, or null when every value fits its column. */
export function validateAccountsReading(reading: AccountsReading): string | null {
	const notANumber = validateCompanyNumber(reading.companyNumber);
	if (notANumber !== null) return notANumber;
	const textTooLong = textBeyondLimit(reading);
	if (textTooLong !== null) return textTooLong;
	const amountTooLarge = amountBeyondLimit(reading);
	if (amountTooLarge !== null) return amountTooLarge;
	const { averageEmployees } = reading;
	const isNotAHeadcount = averageEmployees !== null && (averageEmployees < 0 || averageEmployees > mostEmployees || !Number.isInteger(averageEmployees));
	if (isNotAHeadcount) return `averageEmployees must be a whole number from 0 to ${mostEmployees}: misread, not stored.`;
	return null;
}

function textBeyondLimit(reading: AccountsReading): string | null {
	const texts: [string, string, number][] = [
		['accountsType', reading.accountsType, accountsReadingLimits.accountsType],
		['transactionId', reading.transactionId, accountsReadingLimits.transactionId],
		['documentUrl', reading.documentUrl, accountsReadingLimits.link],
		['readPage', reading.readPage, accountsReadingLimits.link]
	];
	const tooLong = texts.find(([, text, limit]) => text.length > limit);
	return tooLong === undefined ? null : `${tooLong[0]} is longer than ${tooLong[2]} characters: not stored.`;
}

function amountBeyondLimit(reading: AccountsReading): string | null {
	const amounts: [string, number | null][] = [
		['cash', reading.cash],
		['currentAssets', reading.currentAssets],
		['netAssets', reading.netAssets],
		['creditors', reading.creditors]
	];
	const tooLarge = amounts.find(([, amount]) => amount !== null && (!Number.isFinite(amount) || Math.abs(amount) > largestFigure));
	return tooLarge === undefined ? null : `${tooLarge[0]} is beyond ${largestFigure}: misread, not stored.`;
}
