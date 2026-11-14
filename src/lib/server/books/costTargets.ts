import type { SupabaseClient } from '@supabase/supabase-js';
import type { CostAccount } from '$lib/data/books/expenseRules';
import type { ExpenseCost } from '$lib/data/books/expensePostings';
import { findOrganisationRecords, unusableRecordRefusal, type BooksRecord } from './organisationRecords';

/** An account a cost names, as the organisation's chart holds it. */
export type CostAccountRecord = BooksRecord & CostAccount;

/** Which accounts a kind of cost may be coded to, and what to say of one it may not. */
export type CostAccountRule = { accepts: (account: CostAccount) => boolean; refusal: (account: CostAccountRecord) => string };

/** Why the cost's account or cost centre is not the organisation's to code it to under the rule, or null when both are. */
export async function costTargetRefusal(
	supabase: SupabaseClient,
	organisationId: string,
	cost: ExpenseCost,
	rule: CostAccountRule
): Promise<string | null> {
	const accountIds = [cost.expenseAccountId];
	const columns = 'id, is_archived, code, account_type';
	const accounts = await findOrganisationRecords<CostAccountRecord>(supabase, 'books_ledger_accounts', organisationId, accountIds, columns);
	const unusable = unusableRecordRefusal('expense account', accountIds, accounts);
	if (unusable !== null) return unusable;
	const [account] = accounts;
	if (!rule.accepts(account)) return rule.refusal(account);
	return costCentreRefusal(supabase, organisationId, cost.costCentreId);
}

/** Why the cost centre a cost is kept within is not the organisation's to use, or null when it is or none is named. */
export async function costCentreRefusal(supabase: SupabaseClient, organisationId: string, costCentreId: string | null): Promise<string | null> {
	if (costCentreId === null) return null;
	const costCentres = await findOrganisationRecords(supabase, 'books_cost_centres', organisationId, [costCentreId]);
	return unusableRecordRefusal('cost centre', [costCentreId], costCentres);
}
