import type { SupabaseClient } from '@supabase/supabase-js';
import type { InvoiceLineInput } from '$lib/data/books/invoiceLineRules';
import { BooksRefusal } from './booksRefusal';
import { runBooksStep } from './booksStep';
import { isInvoiceLineKept } from './invoiceLines';
import { toInvoiceLineRow, type InvoiceHeader } from './invoiceRecord';
import { invoiceMoveWords, invoiceTarget } from './invoiceSteps';

const replaceLinesStep = 'replace_books_invoice_lines';

/**
 * Puts the lines given in place of every line the draft held, in one step of the database that refuses unless the
 * invoice is still a draft, so a draft is never issued from lines half replaced and an issued invoice's lines never
 * change. Each new line is given its id first, so that when the answer is lost the server can look for it.
 */
export async function replaceDraftLines(supabase: SupabaseClient, organisationId: string, invoice: InvoiceHeader, lines: InvoiceLineInput[]): Promise<void> {
	const newLines = lines.map((line, position) => ({ id: crypto.randomUUID(), ...toInvoiceLineRow(organisationId, invoice.id, line, position) }));
	const [firstLine] = newLines;
	const isReplaced = await runBooksStep(supabase, {
		name: replaceLinesStep,
		inputs: { ...invoiceTarget(organisationId, invoice.id), new_lines: newLines },
		hasHappened: () => isInvoiceLineKept(supabase, organisationId, invoice.id, firstLine.id),
		...invoiceMoveWords(`number ${invoice.invoiceNumber}`, 'given its new lines')
	});
	if (isReplaced) return;
	throw new BooksRefusal(`Invoice number ${invoice.invoiceNumber} stopped being a draft while it was being changed; read_invoice says where it stands.`);
}
