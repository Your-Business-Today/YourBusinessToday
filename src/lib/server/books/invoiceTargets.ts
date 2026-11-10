import type { SupabaseClient } from '@supabase/supabase-js';
import { LedgerAccountTypes, type LedgerAccountType } from '$lib/data/books/ledgerAccountTypes';
import type { InvoiceLineInput } from '$lib/data/books/invoiceLineRules';
import { findOrganisationRecords, unusableRecordRefusal, type BooksRecord } from './organisationRecords';

/** The customer and lines an invoice write points at; either is left out of a change that keeps what the draft holds. */
export type InvoiceTargets = { customerId?: string; lines?: InvoiceLineInput[] };

type AccountRecord = BooksRecord & { account_type: LedgerAccountType };

/** Why the invoice's customer, income accounts or cost centres are not the organisation's to use, or null when all are. */
export async function invoiceTargetRefusal(supabase: SupabaseClient, organisationId: string, targets: InvoiceTargets): Promise<string | null> {
	const customerRefusal = await unusableCustomerRefusal(supabase, organisationId, targets.customerId);
	if (customerRefusal !== null) return customerRefusal;
	const lines = targets.lines ?? [];
	const accountRefusal = await incomeAccountRefusal(supabase, organisationId, lines);
	if (accountRefusal !== null) return accountRefusal;
	const costCentreIds = lines.flatMap((line) => (line.costCentreId === null ? [] : [line.costCentreId]));
	const costCentres = await findOrganisationRecords(supabase, 'books_cost_centres', organisationId, costCentreIds);
	return unusableRecordRefusal('cost centre', costCentreIds, costCentres);
}

async function unusableCustomerRefusal(supabase: SupabaseClient, organisationId: string, customerId: string | undefined): Promise<string | null> {
	if (customerId === undefined) return null;
	const [customer] = await findOrganisationRecords(supabase, 'books_customers', organisationId, [customerId]);
	if (customer === undefined) return `No customer ${customerId} is in this organisation's books; list_customer_balances lists them.`;
	if (customer.is_archived !== true) return null;
	return `The customer ${customerId} is archived, so no new invoice is raised to it; update_customer brings it back.`;
}

async function incomeAccountRefusal(supabase: SupabaseClient, organisationId: string, lines: InvoiceLineInput[]): Promise<string | null> {
	const accountIds = lines.map((line) => line.incomeAccountId);
	const accounts = await findOrganisationRecords<AccountRecord>(supabase, 'books_ledger_accounts', organisationId, accountIds, 'id, is_archived, account_type');
	const unusable = unusableRecordRefusal('income account', accountIds, accounts);
	if (unusable !== null) return unusable;
	const notIncome = accounts.find((account) => account.account_type !== LedgerAccountTypes.income);
	if (notIncome === undefined) return null;
	return `The account ${notIncome.id} is of type ${notIncome.account_type}; an invoice line's sale posts to an income account, as read_chart_of_accounts lists them.`;
}
