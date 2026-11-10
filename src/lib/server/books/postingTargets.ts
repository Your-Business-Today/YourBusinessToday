import type { SupabaseClient } from '@supabase/supabase-js';
import type { JournalInput } from '$lib/data/books/journalRules';

type BooksRecord = { id: string; is_archived?: boolean };

/** Why a journal's accounts, cost centres or reversed journal are not the organisation's to post to, or null. */
export async function postingTargetRefusal(supabase: SupabaseClient, organisationId: string, journal: JournalInput): Promise<string | null> {
	const accountIds = journal.lines.map((line) => line.accountId);
	const accounts = await findOrganisationRecords(supabase, 'books_ledger_accounts', organisationId, accountIds);
	const accountRefusal = unusableRecordRefusal('account', accountIds, accounts);
	if (accountRefusal !== null) return accountRefusal;
	const costCentreIds = journal.lines.flatMap((line) => (line.costCentreId === null ? [] : [line.costCentreId]));
	const costCentres = await findOrganisationRecords(supabase, 'books_cost_centres', organisationId, costCentreIds);
	const costCentreRefusal = unusableRecordRefusal('cost centre', costCentreIds, costCentres);
	if (costCentreRefusal !== null) return costCentreRefusal;
	return reversedJournalRefusal(supabase, organisationId, journal.reversesJournalId);
}

async function reversedJournalRefusal(supabase: SupabaseClient, organisationId: string, journalId: string | null): Promise<string | null> {
	if (journalId === null) return null;
	const journals = await findOrganisationRecords(supabase, 'books_journals', organisationId, [journalId], 'id');
	return unusableRecordRefusal('reversed journal', [journalId], journals);
}

async function findOrganisationRecords(
	supabase: SupabaseClient,
	table: string,
	organisationId: string,
	ids: string[],
	columns = 'id, is_archived'
): Promise<BooksRecord[]> {
	if (ids.length === 0) return [];
	const { data, error } = await supabase.from(table).select(columns).eq('organisation_id', organisationId).in('id', ids);
	if (error !== null) throw error;
	return data as unknown as BooksRecord[];
}

function unusableRecordRefusal(recordName: string, ids: string[], records: BooksRecord[]): string | null {
	const missingId = ids.find((id) => !records.some((record) => record.id === id));
	if (missingId !== undefined) return `No ${recordName} ${missingId} is in this organisation's books.`;
	const archived = records.find((record) => record.is_archived === true);
	if (archived !== undefined) return `The ${recordName} ${archived.id} is archived, so nothing posts to it.`;
	return null;
}
