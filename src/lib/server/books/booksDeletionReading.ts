import type { SupabaseClient } from '@supabase/supabase-js';
import { validateRecordId } from '$lib/data/isUuid';
import type { BooksDeletionKind } from '$lib/data/books/deletionRecordRules';
import { BooksRefusal, refuseWhen } from './booksRefusal';
import { booksDeletionsTable } from './booksDeletions';

type Row = Record<string, unknown>;

/** What was deleted from the books, as its record keeps it: the copy, any journals that went with it, who and when. */
export type BooksDeletion = {
	id: string;
	kind: BooksDeletionKind;
	recordId: string;
	knownAs: string;
	record: Row;
	journals: Row[];
	deletedByAccountId: string;
	deletedAt: string;
};

type BooksDeletionRow = {
	id: string;
	kind: BooksDeletionKind;
	record_id: string;
	known_as: string;
	record: Row;
	journals: Row[];
	deleted_by_account_id: string;
	deleted_at: string;
};

export const BooksDeletionReading = { mostShown: 50 } as const;

const deletionColumns = 'id, kind, record_id, known_as, record, journals, deleted_by_account_id, deleted_at';

/** The organisation's latest deletions from its books, the newest first. */
export async function findBooksDeletions(supabase: SupabaseClient, organisationId: string): Promise<BooksDeletion[]> {
	const { data, error } = await supabase
		.from(booksDeletionsTable)
		.select(deletionColumns)
		.eq('organisation_id', organisationId)
		.order('deleted_at', { ascending: false })
		.range(0, BooksDeletionReading.mostShown - 1);
	if (error !== null) throw error;
	return (data as unknown as BooksDeletionRow[]).map(fromDeletionRow);
}

/** The organisation's deletion with that id, or a refusal when the id is not one or its books record no such deletion. */
export async function findBooksDeletion(supabase: SupabaseClient, organisationId: string, deletionId: unknown): Promise<BooksDeletion> {
	refuseWhen(validateRecordId('deletion', String(deletionId ?? '')));
	const { data, error } = await supabase
		.from(booksDeletionsTable)
		.select(deletionColumns)
		.eq('organisation_id', organisationId)
		.eq('id', deletionId as string)
		.maybeSingle();
	if (error !== null) throw error;
	if (data === null) throw new BooksRefusal(`No deletion ${deletionId} is recorded in this organisation's books; list_books_deletions lists them.`);
	return fromDeletionRow(data as unknown as BooksDeletionRow);
}

function fromDeletionRow(row: BooksDeletionRow): BooksDeletion {
	return {
		id: row.id,
		kind: row.kind,
		recordId: row.record_id,
		knownAs: row.known_as,
		record: row.record,
		journals: row.journals ?? [],
		deletedByAccountId: row.deleted_by_account_id,
		deletedAt: row.deleted_at
	};
}
