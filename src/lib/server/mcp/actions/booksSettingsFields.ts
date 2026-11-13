import { textField } from '../actionTypes';
import { booksSettingsRanges } from '$lib/data/books/booksSettingsRules';
import { longestFirstPeriodMonths } from '$lib/data/books/firstPeriodRules';

const keepWhatIsThere = '; leave out to keep what the books hold';

const settingText = (description: string) => textField(`${description}${keepWhatIsThere}`);

const settingWholeNumber = (description: string) => ({ type: 'integer', description: `${description}${keepWhatIsThere}` });

const firstPeriodDay = (description: string) => ({
	type: ['string', 'null'],
	description: `${description}, written as 2026-07-09; give it with the other, both as null to clear them${keepWhatIsThere}`
});

const { paymentTermsDays, financialYearStartMonth, nextInvoiceNumber } = booksSettingsRanges;

export const booksSettingsFields = {
	companyName: settingText('The company name as it prints on an invoice; cannot be blank'),
	companyAddress: settingText('The company address as it prints on an invoice; empty text clears it'),
	companyEmail: settingText('The company email as it prints on an invoice; empty text clears it'),
	paymentInstructions: settingText('How customers should pay, as it prints on an invoice; empty text clears it'),
	bankAccountName: settingText('The name on the bank account customers pay into; empty text clears it'),
	bankAccountNumber: settingText('The number of the bank account customers pay into; empty text clears it'),
	bankSortCode: settingText('The sort code of the bank account customers pay into; empty text clears it'),
	paymentTermsDays: settingWholeNumber(
		`The days from an invoice's issue to its due date, a whole number from ${paymentTermsDays.smallest} to ${paymentTermsDays.largest}`
	),
	financialYearStartMonth: settingWholeNumber(
		`The month the financial year starts, ${financialYearStartMonth.smallest} for January to ${financialYearStartMonth.largest} for December`
	),
	firstPeriodStart: firstPeriodDay("A new company's first accounting period: its first day, the day the company was formed"),
	firstPeriodEnd: firstPeriodDay(
		`The first accounting period's last day: the day before a financial year starts, at most ${longestFirstPeriodMonths} months on`
	),
	invoicePrefix: settingText('The prefix before every invoice number, such as INV; cannot be blank'),
	nextInvoiceNumber: settingWholeNumber(
		`The number the next invoice takes, from ${nextInvoiceNumber.smallest}, and above every invoice number already in these books`
	)
};
