import { readDay } from './days';

/** What a staff member's Claude sends after reading a balance sheet filed only as a PDF. */
export type PdfReadingSent = { madeUpTo: string; cash: number; currentAssets: number | null; page: string };

const wholePounds = /^-?\d+$/;

export const pdfReadingFieldRules = {
	madeUpTo: 'madeUpTo must be the date the accounts are made up to, as YYYY-MM-DD.',
	cash: 'cash must be whole pounds written as digits, such as 12000.',
	currentAssets: 'currentAssets must be whole pounds written as digits, such as 45000, or left out.',
	page: "page must be the company's own document page on Companies House, as read_company_accounts gave it."
};

/** The values as sent, or the refusal naming the field and what it takes; nothing is repaired. */
export function readPdfReadingSent(madeUpToText: string, cashText: string, currentAssetsText: string, page: string): PdfReadingSent | string {
	const madeUpTo = readDay(madeUpToText);
	if (typeof madeUpTo !== 'string') return pdfReadingFieldRules.madeUpTo;
	const isCashPounds = wholePounds.test(cashText);
	if (!isCashPounds) return pdfReadingFieldRules.cash;
	const isCurrentAssetsLeftOut = currentAssetsText === '';
	const isCurrentAssetsPounds = isCurrentAssetsLeftOut || wholePounds.test(currentAssetsText);
	if (!isCurrentAssetsPounds) return pdfReadingFieldRules.currentAssets;
	if (page === '') return pdfReadingFieldRules.page;
	return { madeUpTo, cash: Number(cashText), currentAssets: isCurrentAssetsLeftOut ? null : Number(currentAssetsText), page };
}
