import type { SupabaseClient } from '@supabase/supabase-js';
import type { LedgerAccountType } from '$lib/data/books/ledgerAccountTypes';

export type LedgerAccount = { id: string; code: string; name: string; accountType: LedgerAccountType; isSystem: boolean; isArchived: boolean };

export type CostCentre = { id: string; name: string; isArchived: boolean };

/** The accounts an organisation posts to, and the cost centres its lines can be kept within. */
export type ChartOfAccounts = { accounts: LedgerAccount[]; costCentres: CostCentre[] };

export type LedgerAccountRow = { id: string; code: string; name: string; account_type: LedgerAccountType; is_system: boolean; is_archived: boolean };

export type CostCentreRow = { id: string; name: string; is_archived: boolean };

export const ledgerAccountColumns = 'id, code, name, account_type, is_system, is_archived';

export const costCentreColumns = 'id, name, is_archived';

/** Every account in an organisation's books in code order, and every cost centre by name, archived ones included. */
export async function findChartOfAccounts(supabase: SupabaseClient, organisationId: string): Promise<ChartOfAccounts> {
	const [accounts, costCentres] = await Promise.all([
		supabase.from('books_ledger_accounts').select(ledgerAccountColumns).eq('organisation_id', organisationId).order('code'),
		supabase.from('books_cost_centres').select(costCentreColumns).eq('organisation_id', organisationId).order('name')
	]);
	if (accounts.error !== null) throw accounts.error;
	if (costCentres.error !== null) throw costCentres.error;
	return {
		accounts: (accounts.data as LedgerAccountRow[]).map(fromLedgerAccountRow),
		costCentres: (costCentres.data as CostCentreRow[]).map(fromCostCentreRow)
	};
}

/** The organisation's account with the code, or null when its chart has none. */
export async function findLedgerAccountByCode(supabase: SupabaseClient, organisationId: string, code: string): Promise<LedgerAccount | null> {
	const { data, error } = await supabase
		.from('books_ledger_accounts')
		.select(ledgerAccountColumns)
		.eq('organisation_id', organisationId)
		.eq('code', code)
		.maybeSingle();
	if (error !== null) throw error;
	if (data === null) return null;
	return fromLedgerAccountRow(data as LedgerAccountRow);
}

export function fromLedgerAccountRow(row: LedgerAccountRow): LedgerAccount {
	return { id: row.id, code: row.code, name: row.name, accountType: row.account_type, isSystem: row.is_system, isArchived: row.is_archived };
}

export function fromCostCentreRow(row: CostCentreRow): CostCentre {
	return { id: row.id, name: row.name, isArchived: row.is_archived };
}
