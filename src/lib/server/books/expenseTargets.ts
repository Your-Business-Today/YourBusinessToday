import type { SupabaseClient } from '@supabase/supabase-js';
import { isCostAccount, type ExpenseInput, type ExpenseRequest } from '$lib/data/books/expenseRules';
import type { ExpenseCost } from '$lib/data/books/expensePostings';
import { SystemAccounts } from '$lib/data/books/systemAccounts';
import { refuseWhen } from './booksRefusal';
import { costCentreRefusal, costTargetRefusal, type CostAccountRecord, type CostAccountRule } from './costTargets';
import { findOrOpenSystemAccount } from './systemAccounts';

const supplierCostAccounts: CostAccountRule = { accepts: isCostAccount, refusal: notCostAccountRefusal };

/** Why the cost's account or cost centre is not the organisation's to code it to, or null when both are. */
export async function expenseTargetRefusal(supabase: SupabaseClient, organisationId: string, cost: ExpenseCost): Promise<string | null> {
	return costTargetRefusal(supabase, organisationId, cost, supplierCostAccounts);
}

/**
 * The cost with the id of the account it is coded to. A cost paid up front is coded to Prepayments, opened as the books'
 * own account when the chart has none yet, once its cost centre is known to be usable, so a refused cost opens nothing.
 */
export async function withCostAccount(supabase: SupabaseClient, organisationId: string, request: ExpenseRequest): Promise<ExpenseInput> {
	const { costAccount, ...cost } = request;
	if (!costAccount.isPaidUpFront) return { ...cost, expenseAccountId: costAccount.expenseAccountId };
	refuseWhen(await costCentreRefusal(supabase, organisationId, cost.costCentreId));
	const prepaymentsId = await findOrOpenSystemAccount(supabase, organisationId, SystemAccounts.prepayments);
	return { ...cost, expenseAccountId: prepaymentsId };
}

function notCostAccountRefusal(account: CostAccountRecord): string {
	const prepayments = SystemAccounts.prepayments;
	return (
		`The account ${account.id} is ${account.code}, of type ${account.account_type}; a cost is coded to an expense account, or to ` +
		`${prepayments.code} ${prepayments.name} when it is paid up front for months to come, as read_chart_of_accounts lists them.`
	);
}
