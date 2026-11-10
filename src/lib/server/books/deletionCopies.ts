import type { SupabaseClient } from '@supabase/supabase-js';
import { invoicesTable } from './invoiceRecord';
import { expensesTable } from './expenses';

type Row = Record<string, unknown>;

type RowsAnswer = PromiseLike<{ data: unknown; error: unknown }>;

/** A cost as its tables hold it, and the journals it posted with their lines, ready to be kept in its deletion record. */
export type CostCopy = { record: Row; journals: Row[] };

/** The invoice row exactly as the books hold it, with every one of its lines in order. */
export async function copyInvoiceWithLines(supabase: SupabaseClient, organisationId: string, invoiceId: string): Promise<Row> {
	const [invoices, lines] = await Promise.all([
		rowsOf(supabase.from(invoicesTable).select('*').eq('organisation_id', organisationId).eq('id', invoiceId)),
		rowsOf(
			supabase.from('books_invoice_lines').select('*').eq('organisation_id', organisationId).eq('invoice_id', invoiceId).order('position')
		)
	]);
	return { ...invoices[0], lines };
}

/** The cost row exactly as the books hold it, with its recording and payment journals and their lines. */
export async function copyCostWithJournals(supabase: SupabaseClient, organisationId: string, expenseId: string): Promise<CostCopy> {
	const [record] = await rowsOf(supabase.from(expensesTable).select('*').eq('organisation_id', organisationId).eq('id', expenseId));
	const journalIds = [record?.recorded_journal_id, record?.payment_journal_id].filter((journalId) => typeof journalId === 'string');
	return { record: record ?? {}, journals: await copyJournalsWithLines(supabase, organisationId, journalIds) };
}

async function copyJournalsWithLines(supabase: SupabaseClient, organisationId: string, journalIds: unknown[]): Promise<Row[]> {
	if (journalIds.length === 0) return [];
	const [journals, lines] = await Promise.all([
		rowsOf(supabase.from('books_journals').select('*').eq('organisation_id', organisationId).in('id', journalIds)),
		rowsOf(supabase.from('books_journal_lines').select('*').eq('organisation_id', organisationId).in('journal_id', journalIds).order('position'))
	]);
	return journals.map((journal) => ({ ...journal, lines: lines.filter((line) => line.journal_id === journal.id) }));
}

async function rowsOf(query: RowsAnswer): Promise<Row[]> {
	const { data, error } = await query;
	if (error !== null && error !== undefined) throw error;
	return (data ?? []) as Row[];
}
