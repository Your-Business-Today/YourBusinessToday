import type { SupabaseClient } from '@supabase/supabase-js';
import { dueDateRefusal, validateInvoiceDraftChange, type InvoiceDraftChange } from '$lib/data/books/invoiceDraftRules';
import { InvoiceStatuses } from '$lib/data/books/invoiceStatuses';
import { validateRecordId } from '$lib/data/isUuid';
import { BooksRefusal, refuseWhen } from './booksRefusal';
import { findInvoiceHeader } from './invoices';
import { replaceDraftLines } from './draftLines';
import { invoicesTable, toInvoiceHeadingColumns, type InvoiceHeader } from './invoiceRecord';
import { invoiceTargetRefusal } from './invoiceTargets';

/**
 * Changes only what was given of one of the organisation's draft invoices; everything left out keeps what the draft
 * holds, and lines given take the place of every line it held, together, while it is still a draft. An invoice that is
 * no longer a draft is refused, as is any value its columns cannot hold, before anything is written.
 */
export async function changeDraftInvoice(supabase: SupabaseClient, organisationId: string, fields: Record<string, unknown>): Promise<void> {
	const change = validateInvoiceDraftChange(fields);
	if (typeof change === 'string') throw new BooksRefusal(change);
	const invoice = await findDraft(supabase, organisationId, fields.invoiceId);
	refuseWhen(dueDateRefusal(change.issueDate ?? invoice.issueDate, change.dueDate ?? invoice.dueDate));
	refuseWhen(await invoiceTargetRefusal(supabase, organisationId, change));
	await changeHeading(supabase, organisationId, invoice, change);
	if (change.lines === undefined) return;
	await replaceDraftLines(supabase, organisationId, invoice, change.lines);
}

async function findDraft(supabase: SupabaseClient, organisationId: string, invoiceId: unknown): Promise<InvoiceHeader> {
	refuseWhen(validateRecordId('invoice', String(invoiceId ?? '')));
	const invoice = await findInvoiceHeader(supabase, organisationId, invoiceId as string);
	if (invoice === null) throw new BooksRefusal(`No invoice ${invoiceId} is in this organisation's books; list_invoices lists them.`);
	refuseWhen(notADraftRefusal(invoice));
	return invoice;
}

async function changeHeading(supabase: SupabaseClient, organisationId: string, invoice: InvoiceHeader, change: InvoiceDraftChange): Promise<void> {
	const columns = toInvoiceHeadingColumns(change);
	const isHeadingChanged = Object.keys(columns).length > 0;
	if (!isHeadingChanged) return;
	const { data, error } = await supabase
		.from(invoicesTable)
		.update(columns)
		.eq('organisation_id', organisationId)
		.eq('id', invoice.id)
		.eq('status', InvoiceStatuses.draft)
		.select('id');
	if (error !== null) throw error;
	const isStillADraft = (data ?? []).length > 0;
	if (isStillADraft) return;
	throw new BooksRefusal(`Invoice number ${invoice.invoiceNumber} stopped being a draft while it was being changed; read_invoice says where it stands.`);
}

function notADraftRefusal(invoice: InvoiceHeader): string | null {
	if (invoice.status === InvoiceStatuses.draft) return null;
	return `Invoice number ${invoice.invoiceNumber} is ${invoice.status}, and only a draft can be changed.`;
}
