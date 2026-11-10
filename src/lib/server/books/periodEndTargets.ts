import type { SupabaseClient } from '@supabase/supabase-js';
import { LedgerAccountTypes } from '$lib/data/books/ledgerAccountTypes';
import type { CostAccount } from '$lib/data/books/expenseRules';
import type { ExpenseCost } from '$lib/data/books/expensePostings';
import { costTargetRefusal, type CostAccountRecord, type CostAccountRule } from './costTargets';

const expenseAccountsOnly: CostAccountRule = { accepts: isExpenseAccount, refusal: notExpenseAccountRefusal };

/** Why a month-end cost's account or cost centre is not the organisation's to post it to, or null when both are. */
export async function periodEndTargetRefusal(supabase: SupabaseClient, organisationId: string, cost: ExpenseCost): Promise<string | null> {
	return costTargetRefusal(supabase, organisationId, cost, expenseAccountsOnly);
}

function isExpenseAccount(account: CostAccount): boolean {
	return account.account_type === LedgerAccountTypes.expense;
}

function notExpenseAccountRefusal(account: CostAccountRecord): string {
	return (
		`The account ${account.id} is ${account.code}, of type ${account.account_type}; month end posts a cost to an expense ` +
		`account, as read_chart_of_accounts lists them.`
	);
}
