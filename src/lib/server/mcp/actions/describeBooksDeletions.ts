import { formatBritishDate } from '$lib/data/britishDate';
import { ukMeetingTime } from '$lib/data/ukMeetingTime';
import { formatPoundsAndPence } from '$lib/data/books/money';
import { BooksDeletionKinds } from '$lib/data/books/deletionRecordRules';
import type { BooksDeletion } from '$lib/server/books/booksDeletionReading';

type NameOfAccount = (accountId: string) => string;

type Row = Record<string, unknown>;

/** The line that tells the caller a record of the deletion is kept, naming it. */
export function keptRecordOf(deletionId: string): string {
	return `A record of what was deleted is kept as deletion ${deletionId}; read_books_deletion reads it.`;
}

/** The deletions shown, newest first, each on one line: what went, who deleted it and when. */
export function describeDeletionList(organisationName: string, deletions: BooksDeletion[], nameOf: NameOfAccount): string {
	if (deletions.length === 0) return `Nothing has been deleted from ${organisationName}'s books.`;
	const heading = `Deleted from ${organisationName}'s books, newest first. ${deletions.length} shown.`;
	return [heading, ...deletions.map((deletion) => `- ${describeDeletion(deletion, nameOf)}`)].join('\n');
}

/** One deletion with the copy its record keeps, as the books held it, so it can be put back. */
export function describeDeletionInFull(deletion: BooksDeletion, nameOf: NameOfAccount): string {
	const copy = JSON.stringify({ record: deletion.record, journals: deletion.journals }, null, 2);
	return `${describeDeletion(deletion, nameOf)}\nThe copy, as the books held it:\n\`\`\`json\n${copy}\n\`\`\``;
}

function describeDeletion(deletion: BooksDeletion, nameOf: NameOfAccount): string {
	const when = ukMeetingTime(deletion.deletedAt);
	return `${when}: ${describeWhatWent(deletion)}; deleted by ${nameOf(deletion.deletedByAccountId)}. Id ${deletion.id}`;
}

function describeWhatWent(deletion: BooksDeletion): string {
	if (deletion.kind === BooksDeletionKinds.invoice) return describeInvoiceThatWent(deletion);
	return describeCostThatWent(deletion);
}

function describeCostThatWent(deletion: BooksDeletion): string {
	const record = deletion.record;
	const amount = formatPoundsAndPence(Number(record.amount ?? 0));
	return `cost from ${deletion.knownAs}${describeDay(record.expense_date)}, ${amount}, with ${countOf(deletion.journals, 'journal')}`;
}

function describeInvoiceThatWent(deletion: BooksDeletion): string {
	const record = deletion.record;
	const customer = typeof record.customer_name === 'string' ? ` to ${record.customer_name}` : '';
	const lines = Array.isArray(record.lines) ? (record.lines as Row[]) : [];
	return `${String(record.status ?? '')} invoice ${deletion.knownAs}${customer}${describeDay(record.issue_date)}, with ${countOf(lines, 'line')}`;
}

function describeDay(isoDate: unknown): string {
	if (typeof isoDate !== 'string') return '';
	return ` dated ${formatBritishDate(isoDate)}`;
}

function countOf(rows: Row[], noun: string): string {
	const isOne = rows.length === 1;
	return `${rows.length} ${noun}${isOne ? '' : 's'}`;
}
