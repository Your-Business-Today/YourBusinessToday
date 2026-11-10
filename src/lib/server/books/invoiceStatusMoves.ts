import type { SupabaseClient } from '@supabase/supabase-js';
import type { InvoiceStatus } from '$lib/data/books/invoiceStatuses';
import { BooksRefusal } from './booksRefusal';
import { invoicesTable } from './invoiceRecord';
import type { HeldInvoice } from './heldInvoice';

/** A move of an invoice on from the status it was read in, with the columns that change and the journal posted for it. */
export type InvoiceMove = { from: InvoiceStatus; columns: Record<string, unknown>; journalId: string | null };

/**
 * Moves the invoice on only while it still stands where it was read. When it has moved meanwhile, or the change cannot
 * be kept, the journal posted for the move is taken back out of the ledger, so no posting is left without its invoice.
 */
export async function moveInvoiceOrWithdraw(supabase: SupabaseClient, organisationId: string, invoice: HeldInvoice, move: InvoiceMove): Promise<void> {
	const { data, error } = await supabase
		.from(invoicesTable)
		.update(move.columns)
		.eq('organisation_id', organisationId)
		.eq('id', invoice.id)
		.eq('status', move.from)
		.select('id');
	const isMoved = error === null && (data ?? []).length > 0;
	if (isMoved) return;
	await withdrawJournal(supabase, organisationId, move.journalId);
	if (error !== null) throw error;
	throw new BooksRefusal(`Invoice ${invoice.printedNumber} stopped being ${move.from} while it was being changed; read_invoice says where it stands.`);
}

/** Takes out of the ledger a journal that was posted for a move that did not happen; its lines go with it. */
export async function withdrawJournal(supabase: SupabaseClient, organisationId: string, journalId: string | null): Promise<void> {
	if (journalId === null) return;
	const { error } = await supabase.from('books_journals').delete().eq('organisation_id', organisationId).eq('id', journalId);
	if (error !== null) throw error;
}
