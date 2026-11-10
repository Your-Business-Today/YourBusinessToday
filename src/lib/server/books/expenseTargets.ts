import type { SupabaseClient } from '@supabase/supabase-js';
import { isCostAccount } from '$lib/data/books/expenseRules';
import type { ExpenseCost } from '$lib/data/books/expensePostings';
import { SystemAccounts } from '$lib/data/books/systemAccounts';
import { costTargetRefusal, type CostAccountRecord, type CostAccountRule } from './costTargets';

const supplierCostAccounts: CostAccountRule = { accepts: isCostAccount, refusal: notCostAccountRefusal };

/** Why the cost's account or cost centre is not the organisation's to code it to, or null when both are. */
export async function expenseTargetRefusal(supabase: SupabaseClient, organisationId: string, cost: ExpenseCost): Promise<string | null> {
	return costTargetRefusal(supabase, organisationId, cost, supplierCostAccounts);
}

function notCostAccountRefusal(account: CostAccountRecord): string {
	const prepayments = SystemAccounts.prepayments;
	return (
		`The account ${account.id} is ${account.code}, of type ${account.account_type}; a cost is coded to an expense account, or to ` +
		`${prepayments.code} ${prepayments.name} when it is paid up front for months to come, as read_chart_of_accounts lists them.`
	);
}
