import { validateIsoDate } from '$lib/data/books/isoDate';
import { BankLineMatchings, type BankLineMatching } from './bankLines';
import { BooksRefusal, refuseWhen } from './booksRefusal';

/** The days and the matching a reading of statement lines asks for, each left out for no limit. */
export type BankLineReading = { from: string | null; to: string | null; matching: BankLineMatching };

const matchings: readonly unknown[] = Object.values(BankLineMatchings);

/** The reading as asked, or a refusal naming the field that cannot be read. */
export function readBankLineReading(fields: Record<string, unknown>): BankLineReading {
	const from = optionalDay('from', fields.from);
	const to = optionalDay('to', fields.to);
	const isBackwards = from !== null && to !== null && to < from;
	if (isBackwards) throw new BooksRefusal(`to is on or after from; ${to} is before ${from}.`);
	return { from, to, matching: matchingOf(fields.matching) };
}

function optionalDay(field: string, value: unknown): string | null {
	if (value === undefined) return null;
	refuseWhen(validateIsoDate(field, value));
	return value as string;
}

function matchingOf(value: unknown): BankLineMatching {
	if (value === undefined) return BankLineMatchings.all;
	if (matchings.includes(value)) return value as BankLineMatching;
	throw new BooksRefusal(`matching is one of ${matchings.join(', ')}; ${JSON.stringify(value)} was given.`);
}
