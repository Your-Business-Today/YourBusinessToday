import { validateRecordId } from '$lib/data/isUuid';
import { validateIsoDate } from './isoDate';
import { isJournalKind, journalKinds, type JournalKind } from './journalKinds';
import { journalBalanceRefusal } from './journalBalance';
import { validateJournalLine, type JournalLineFields, type JournalLineInput } from './journalLine';

/** A journal ready to post: dated, described, of a kind, with lines whose debits equal their credits. */
export type JournalInput = {
	journalDate: string;
	description: string;
	kind: JournalKind;
	reversesJournalId: string | null;
	lines: JournalLineInput[];
};

export type JournalFields = {
	journalDate?: unknown;
	description?: unknown;
	kind?: unknown;
	reversesJournalId?: unknown;
	lines?: unknown;
};

/** The journal as given, or the first reason it cannot be posted. */
export function validateJournal(fields: JournalFields): JournalInput | string {
	const headingRefusal = journalHeadingRefusal(fields);
	if (headingRefusal !== null) return headingRefusal;
	if (!Array.isArray(fields.lines)) return 'lines is a list of journal lines.';
	const lines = fields.lines.map((line: JournalLineFields, index) => validateJournalLine(line ?? {}, index + 1));
	const lineRefusal = lines.find((line) => typeof line === 'string');
	if (lineRefusal !== undefined) return lineRefusal;
	const validLines = lines as JournalLineInput[];
	const balanceRefusal = journalBalanceRefusal(validLines);
	if (balanceRefusal !== null) return balanceRefusal;
	return {
		journalDate: fields.journalDate as string,
		description: fields.description as string,
		kind: fields.kind as JournalKind,
		reversesJournalId: (fields.reversesJournalId ?? null) as string | null,
		lines: validLines
	};
}

function journalHeadingRefusal(fields: JournalFields): string | null {
	const dateRefusal = validateIsoDate('journalDate', fields.journalDate);
	if (dateRefusal !== null) return dateRefusal;
	const isDescribed = typeof fields.description === 'string' && fields.description.trim() !== '';
	if (!isDescribed) return 'description says what the journal is for.';
	if (!isJournalKind(fields.kind)) return `kind is one of ${journalKinds.join(', ')}.`;
	const isReversal = fields.reversesJournalId !== undefined && fields.reversesJournalId !== null;
	if (!isReversal) return null;
	return validateRecordId('reversed journal', String(fields.reversesJournalId));
}
