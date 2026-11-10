import type { SupabaseClient } from '@supabase/supabase-js';
import { isCostAccount, type CostAccount } from '$lib/data/books/expenseRules';
import type { ExpenseCost } from '$lib/data/books/expensePostings';
import { SystemAccounts } from '$lib/data/books/systemAccounts';
import { findOrganisationRecords, unusableRecordRefusal, type BooksRecord } from './organisationRecords';

type AccountRecord = BooksRecord & CostAccount;

/** Why the cost's account or cost centre is not the organisation's to code it to, or null when both are. */
export async function expenseTargetRefusal(supabase: SupabaseClient, organisationId: string, cost: ExpenseCost): Promise<string | null> {
	const accountIds = [cost.expenseAccountId];
	const columns = 'id, is_archived, code, account_type';
	const accounts = await findOrganisationRecords<AccountRecord>(supabase, 'books_ledger_accounts', organisationId, accountIds, columns);
	const unusable = unusableRecordRefusal('expense account', accountIds, accounts);
	if (unusable !== null) return unusable;
	const [account] = accounts;
	if (!isCostAccount(account)) return notCostAccountRefusal(account);
	if (cost.costCentreId === null) return null;
	const costCentres = await findOrganisationRecords(supabase, 'books_cost_centres', organisationId, [cost.costCentreId]);
	return unusableRecordRefusal('cost centre', [cost.costCentreId], costCentres);
}

function notCostAccountRefusal(account: AccountRecord): string {
	const prepayments = SystemAccounts.prepayments;
	return (
		`The account ${account.id} is ${account.code}, of type ${account.account_type}; a cost is coded to an expense account, or to ` +
		`${prepayments.code} ${prepayments.name} when it is paid up front for months to come, as read_chart_of_accounts lists them.`
	);
}
