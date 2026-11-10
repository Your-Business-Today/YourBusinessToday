import type { SupabaseClient } from '@supabase/supabase-js';
import { invoiceSettingDefaults } from '$lib/data/books/booksSettings';
import { dueDateRefusal, validateNewInvoiceDraft, type InvoiceHeading, type NewInvoiceDraft } from '$lib/data/books/invoiceDraftRules';
import { InvoiceStatuses } from '$lib/data/books/invoiceStatuses';
import { isoDateDaysFrom } from '$lib/data/demo/demoDates';
import { ukClockAt } from '$lib/data/ukClock';
import { validateRecordId } from '$lib/data/isUuid';
import { BooksRefusal, refuseWhen } from './booksRefusal';
import { findBooksSettings } from './booksSettings';
import { advanceInvoiceNumbering, findNextInvoiceNumber } from './invoiceNumbering';
import { insertInvoiceLines } from './invoiceLines';
import { invoicesTable, toInvoiceHeadingColumns } from './invoiceRecord';
import { invoiceTargetRefusal } from './invoiceTargets';

type Numbering = { next: number; paymentTermsDays: number };

const PostgresErrors = { uniqueViolation: '23505' } as const;

const numberingAttempts = 3;

/**
 * Drafts an invoice with its lines in the organisation's books and answers its id. It takes the next number of the
 * organisation's own numbering, is dated today and falls due after the payment terms unless the dates are given, and
 * is refused with the reason before anything is written; lines that fail to save take their draft with them.
 */
export async function draftInvoice(supabase: SupabaseClient, organisationId: string, fields: Record<string, unknown>): Promise<string> {
	refuseWhen(validateRecordId('organisation', organisationId));
	const draft = validateNewInvoiceDraft(fields);
	if (typeof draft === 'string') throw new BooksRefusal(draft);
	const numbering = await findNumbering(supabase, organisationId);
	const heading = datedHeading(draft, numbering.paymentTermsDays);
	refuseWhen(dueDateRefusal(heading.issueDate, heading.dueDate));
	refuseWhen(await invoiceTargetRefusal(supabase, organisationId, draft));
	const invoice = await insertNumberedInvoice(supabase, organisationId, heading, numbering.next);
	await keepLinesOrWithdraw(supabase, organisationId, invoice.id, draft);
	await advanceInvoiceNumbering(supabase, organisationId, invoice.invoiceNumber);
	return invoice.id;
}

async function findNumbering(supabase: SupabaseClient, organisationId: string): Promise<Numbering> {
	const settings = await findBooksSettings(supabase, organisationId);
	if (settings === null) return { next: invoiceSettingDefaults.nextInvoiceNumber, paymentTermsDays: invoiceSettingDefaults.paymentTermsDays };
	return { next: settings.nextInvoiceNumber, paymentTermsDays: settings.paymentTermsDays };
}

function datedHeading(draft: NewInvoiceDraft, paymentTermsDays: number): InvoiceHeading {
	const issueDate = draft.issueDate ?? ukClockAt(new Date()).date;
	const dueDate = draft.dueDate ?? isoDateDaysFrom(issueDate, paymentTermsDays);
	return { customerId: draft.customerId, issueDate, dueDate, reference: draft.reference, notes: draft.notes };
}

async function insertNumberedInvoice(supabase: SupabaseClient, organisationId: string, heading: InvoiceHeading, numberingNext: number) {
	for (let attempt = 1; ; attempt += 1) {
		const invoiceNumber = await findNextInvoiceNumber(supabase, organisationId, numberingNext);
		const { data, error } = await supabase
			.from(invoicesTable)
			.insert(toInvoiceRow(organisationId, heading, invoiceNumber))
			.select('id')
			.single();
		const inserted = data as { id: string };
		if (error === null) return { id: inserted.id, invoiceNumber };
		const isNumberTakenMeanwhile = error.code === PostgresErrors.uniqueViolation && attempt < numberingAttempts;
		if (!isNumberTakenMeanwhile) throw error;
	}
}

async function keepLinesOrWithdraw(supabase: SupabaseClient, organisationId: string, invoiceId: string, draft: NewInvoiceDraft): Promise<void> {
	try {
		await insertInvoiceLines(supabase, organisationId, invoiceId, draft.lines);
	} catch (failure) {
		await supabase.from(invoicesTable).delete().eq('organisation_id', organisationId).eq('id', invoiceId);
		throw failure;
	}
}

function toInvoiceRow(organisationId: string, heading: InvoiceHeading, invoiceNumber: number) {
	return {
		organisation_id: organisationId,
		invoice_number: invoiceNumber,
		status: InvoiceStatuses.draft,
		...toInvoiceHeadingColumns(heading)
	};
}
