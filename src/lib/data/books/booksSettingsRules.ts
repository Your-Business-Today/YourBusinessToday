import { booksSettingNames, type BooksSetting, type BooksSettingsChange } from './booksSettings';

type WholeNumberRange = { smallest: number; largest: number };

const largestIntegerColumnValue = 2147483647;

/** The whole numbers books_settings' integer columns hold (migration 0151), within the rules the books keep. */
export const booksSettingsRanges = {
	paymentTermsDays: { smallest: 0, largest: largestIntegerColumnValue },
	financialYearStartMonth: { smallest: 1, largest: 12 },
	nextInvoiceNumber: { smallest: 1, largest: largestIntegerColumnValue }
} as const satisfies Record<string, WholeNumberRange>;

const printedOnEveryInvoice: BooksSetting[] = ['companyName', 'invoicePrefix'];

/** The settings as given, or the first reason one cannot be kept: never trimmed, rounded or filled in. */
export function validateBooksSettingsChange(fields: Record<string, unknown>): BooksSettingsChange | string {
	const given = booksSettingNames.filter((name) => fields[name] !== undefined);
	if (given.length === 0) return 'No setting was given to change. Give at least one, and leave out the rest to keep them.';
	const refusal = given.map((name) => settingRefusal(name, fields[name])).find((reason) => reason !== null);
	if (refusal !== undefined) return refusal;
	return Object.fromEntries(given.map((name) => [name, fields[name]])) as BooksSettingsChange;
}

function settingRefusal(name: BooksSetting, value: unknown): string | null {
	if (name in booksSettingsRanges) return wholeNumberRefusal(name, booksSettingsRanges[name as keyof typeof booksSettingsRanges], value);
	return textRefusal(name, value);
}

function textRefusal(name: BooksSetting, value: unknown): string | null {
	if (typeof value !== 'string') return `${name} is text; ${JSON.stringify(value)} was given.`;
	const isBlank = value.trim() === '';
	if (isBlank && printedOnEveryInvoice.includes(name)) return `${name} cannot be blank: it prints on every invoice.`;
	return null;
}

function wholeNumberRefusal(name: BooksSetting, range: WholeNumberRange, value: unknown): string | null {
	const isWholeNumber = typeof value === 'number' && Number.isInteger(value);
	const isWithinRange = isWholeNumber && value >= range.smallest && value <= range.largest;
	if (isWithinRange) return null;
	return `${name} is a whole number from ${range.smallest} to ${range.largest}; ${JSON.stringify(value)} was given.`;
}
