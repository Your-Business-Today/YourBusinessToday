import { booksActions } from './booksActions';
import { ledgerDatabase, ledgerTables, ledgerWrites, clearLedgerTables } from './booksLedgerDatabase.fixture';
import { ledgerCalls, nigelAccountId } from './booksLedgerCalls.fixture';
import type { McpAction } from '../actionTypes';
import type { McpCaller } from '../resolveMcpCaller';

export const organisationId = '00000000-0000-4000-8000-0000000000a1';
export const customerId = '00000000-0000-4000-8000-00000000c0a1';
export const salesId = '00000000-0000-4000-8000-000000004000';
export const projectsId = '00000000-0000-4000-8000-0000000cc001';
export const invoiceId = '00000000-0000-4000-8000-0000000d0001';

/** Invoice 6 to Jewel Bespoke Build: two days' website build at £500 and a month's hosting kept within Projects. */
export function holdDraftInvoice(): void {
	clearLedgerTables();
	ledgerTables.books_settings = [{ invoice_prefix: 'INV', next_invoice_number: 7, payment_terms_days: 30 }];
	ledgerTables.books_customers = [{ id: customerId, name: 'Jewel Bespoke Build', contact_name: '', email: '', address: '', is_archived: false, client_id: null }];
	ledgerTables.books_ledger_accounts = [{ id: salesId, code: '4000', name: 'Sales', account_type: 'income', is_system: true, is_archived: false }];
	ledgerTables.books_cost_centres = [{ id: projectsId, name: 'Projects', is_archived: false }];
	ledgerTables.books_invoices = [
		{ id: invoiceId, customer_id: customerId, invoice_number: 6, status: 'draft', issue_date: '2026-11-01', due_date: '2026-12-01', reference: '', notes: '', issued_journal_id: null }
	];
	ledgerTables.books_invoice_lines = [
		{ id: 'line-1', invoice_id: invoiceId, description: 'Website build', quantity: 2, unit_price: 500, income_account_id: salesId, cost_centre_id: null, position: 0 },
		{ id: 'line-2', invoice_id: invoiceId, description: 'Hosting', quantity: 1, unit_price: 20.5, income_account_id: salesId, cost_centre_id: projectsId, position: 1 }
	];
	ledgerTables.books_invoice_payments = [];
	ledgerTables.books_journals = [];
	ledgerTables.books_journal_lines = [];
}

/** The stand-in that keeps what is written, with the database's steps beside its tables. */
export const ledgerSupabase = { ...ledgerDatabase, rpc: ledgerCalls };

/** Runs a books action as Nigel on the organisation, against the stand-in that keeps what is written. */
export function runOnTheLedger(name: string, input: Record<string, unknown>) {
	const supabase = ledgerSupabase;
	const membership = { organisationId, accountId: nigelAccountId, isManager: false };
	const caller = { accountId: nigelAccountId, isStaff: false, supabase, organisationMemberships: [membership] };
	const action = booksActions.find((candidate) => candidate.name === name) as McpAction;
	return action.run(caller as unknown as McpCaller, { organisationId, ...input });
}

export function heldInvoice(): Record<string, unknown> {
	return (ledgerTables.books_invoices ?? []).find((invoice) => invoice.id === invoiceId) ?? {};
}

export function journalsOfKind(kind: string): Record<string, unknown>[] {
	return (ledgerTables.books_journals ?? []).filter((journal) => journal.kind === kind);
}

/** The lines of a journal as debit and credit on each account, in the order they were posted. */
export function postedLines(journalId: unknown) {
	const lines = (ledgerTables.books_journal_lines ?? []).filter((line) => line.journal_id === journalId);
	return lines.map((line) => ({ accountId: line.account_id, costCentreId: line.cost_centre_id, debit: line.debit, credit: line.credit }));
}

export function accountIdOfCode(code: string): unknown {
	return (ledgerTables.books_ledger_accounts ?? []).find((account) => account.code === code)?.id;
}

export function writesTo(table: string) {
	return ledgerWrites.filter((write) => write.table === table);
}
