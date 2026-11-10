import type { SupabaseClient } from '@supabase/supabase-js';
import { validateRecordId } from '$lib/data/isUuid';
import { buildAccountStatement, type AccountStatement, type StatementEntry } from '$lib/data/books/statement/accountStatement';
import { validateStatementPeriod } from '$lib/data/books/statement/statementPeriod';
import type { JournalKind } from '$lib/data/books/journalKinds';
import { BooksRefusal, refuseWhen } from './booksRefusal';
import { findLedgerAccountByCode } from './chartOfAccounts';
import { validatedCostCentreId } from './costCentreChoice';
import { readEveryPage } from './everyPage';

export type AccountStatementRequest = { accountCode: unknown; periodStart?: unknown; periodEnd: unknown; costCentreId?: unknown };

type StatementEntryRow = {
	journal_id: string;
	cost_centre_id: string | null;
	debit: number | string;
	credit: number | string;
	position: number;
	books_journals: { journal_date: string; description: string; kind: JournalKind };
};

const statementEntryColumns = 'id, journal_id, cost_centre_id, debit, credit, position, books_journals!inner(journal_date, description, kind)';

/** The entries behind one account's figure in an organisation's books, over a period or from the start, in one cost centre or all. */
export async function readAccountStatement(supabase: SupabaseClient, organisationId: string, request: AccountStatementRequest): Promise<AccountStatement> {
	refuseWhen(validateRecordId('organisation', organisationId));
	const period = validateStatementPeriod(request.periodStart, request.periodEnd);
	if (typeof period === 'string') throw new BooksRefusal(period);
	const costCentreId = validatedCostCentreId(request.costCentreId);
	const accountCode = String(request.accountCode ?? '').trim();
	const account = await findLedgerAccountByCode(supabase, organisationId, accountCode);
	if (account === null) throw new BooksRefusal(`No account with the code "${accountCode}" is in this organisation's chart of accounts.`);
	const entries = await findStatementEntries(supabase, { organisationId, accountId: account.id, costCentreId, throughDate: period.end });
	return buildAccountStatement(account, entries, period);
}

type StatementQuery = { organisationId: string; accountId: string; costCentreId: string | null; throughDate: string };

async function findStatementEntries(supabase: SupabaseClient, query: StatementQuery): Promise<StatementEntry[]> {
	return readEveryPage((pageStart, pageEnd) => findStatementPage(supabase, query, pageStart, pageEnd));
}

async function findStatementPage(supabase: SupabaseClient, query: StatementQuery, pageStart: number, pageEnd: number): Promise<StatementEntry[]> {
	let request = supabase
		.from('books_journal_lines')
		.select(statementEntryColumns)
		.eq('organisation_id', query.organisationId)
		.eq('account_id', query.accountId)
		.lte('books_journals.journal_date', query.throughDate);
	if (query.costCentreId !== null) request = request.eq('cost_centre_id', query.costCentreId);
	const { data, error } = await request.order('id').range(pageStart, pageEnd);
	if (error !== null) throw error;
	return (data as unknown as StatementEntryRow[]).map(fromStatementEntryRow);
}

function fromStatementEntryRow(row: StatementEntryRow): StatementEntry {
	const journal = row.books_journals;
	return {
		journalId: row.journal_id,
		journalDate: journal.journal_date,
		description: journal.description,
		kind: journal.kind,
		costCentreId: row.cost_centre_id,
		debit: Number(row.debit),
		credit: Number(row.credit),
		position: row.position
	};
}
