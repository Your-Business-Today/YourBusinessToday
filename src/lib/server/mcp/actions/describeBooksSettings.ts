import { defaultFinancialYearStartMonth } from '$lib/server/books/financialYear';
import { monthName } from '$lib/data/books/monthName';
import type { BooksSettings } from '$lib/data/books/booksSettings';

const notSet = '(not set)';

export function describeBooksSettings(organisationName: string, settings: BooksSettings | null): string {
	if (settings === null) return nothingSavedYet(organisationName);
	return [
		`Settings of ${organisationName}'s books:`,
		`- Company name as it prints on an invoice: ${shown(settings.companyName)}`,
		`- Address: ${shown(settings.companyAddress)}`,
		`- Email: ${shown(settings.companyEmail)}`,
		`- How customers should pay: ${shown(settings.paymentInstructions)}`,
		`- Bank account name: ${shown(settings.bankAccountName)}`,
		`- Bank account number: ${shown(settings.bankAccountNumber)}`,
		`- Bank sort code: ${shown(settings.bankSortCode)}`,
		`- Payment terms: ${settings.paymentTermsDays} days from issue to due`,
		`- The financial year starts in ${monthName(settings.financialYearStartMonth)}`,
		`- Invoice prefix ${settings.invoicePrefix}; the next invoice takes number ${settings.nextInvoiceNumber}`
	].join('\n');
}

function nothingSavedYet(organisationName: string): string {
	return (
		`${organisationName}'s books hold no settings yet: no company details, bank details or invoice numbering. ` +
		`change_books_settings sets them. Until then the financial year is read as starting in ` +
		`${monthName(defaultFinancialYearStartMonth)}.`
	);
}

function shown(value: string): string {
	if (value === '') return notSet;
	return value;
}
