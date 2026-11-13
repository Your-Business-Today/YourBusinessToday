import type { SupabaseClient } from '@supabase/supabase-js';
import { validateBankRule, type BankRuleInput } from '$lib/data/books/bankRuleRules';
import { BankRuleKinds, findSameRule } from '$lib/data/books/bankRuleTerms';
import { BooksRefusal, refuseWhen } from './booksRefusal';
import { bankRuleColumns, bankRuleRow, bankRulesTable, findBankRules, fromBankRuleRow, type BankRule, type BankRuleRow } from './bankRules';
import { expenseTargetRefusal } from './expenseTargets';
import { findOrganisationRecords, unusableRecordRefusal } from './organisationRecords';

/** A rule set: the rule as now kept, and the one it replaced for the same counterparty and direction, if there was one. */
export type SetBankRule = { rule: BankRule; replaced: BankRule | null };

const PostgresErrors = { uniqueViolation: '23505' } as const;
const noAmount = 0;

/**
 * Keeps what a bank line from one counterparty always is, replacing the rule for the same counterparty and direction.
 * A rule naming an account or cost centre that is not the organisation's, or is archived, or a cost coded to an account
 * that is not an expense, is refused by name before anything is written.
 */
export async function setBankRule(
	supabase: SupabaseClient,
	organisationId: string,
	setBy: { accountId: string },
	fields: Record<string, unknown>
): Promise<SetBankRule> {
	const given = validateBankRule(fields);
	if (typeof given === 'string') throw new BooksRefusal(given);
	refuseWhen(await ruleTargetRefusal(supabase, organisationId, given));
	const replaced = findSameRule(await findBankRules(supabase, organisationId), given) ?? null;
	const columns = { ...bankRuleRow(given), set_by_account_id: setBy.accountId, updated_at: new Date().toISOString() };
	const written = replaced === null ? insertRule(supabase, organisationId, columns) : updateRule(supabase, organisationId, replaced.id, columns);
	const { data, error } = await written;
	const isSetMeanwhile = error?.code === PostgresErrors.uniqueViolation;
	if (isSetMeanwhile) throw setMeanwhileRefusal(given);
	if (error !== null) throw error;
	return { rule: fromBankRuleRow(data as unknown as BankRuleRow), replaced };
}

function insertRule(supabase: SupabaseClient, organisationId: string, columns: Record<string, unknown>) {
	return supabase
		.from(bankRulesTable)
		.insert({ organisation_id: organisationId, ...columns })
		.select(bankRuleColumns)
		.single();
}

function updateRule(supabase: SupabaseClient, organisationId: string, bankRuleId: string, columns: Record<string, unknown>) {
	return supabase.from(bankRulesTable).update(columns).eq('organisation_id', organisationId).eq('id', bankRuleId).select(bankRuleColumns).single();
}

async function ruleTargetRefusal(supabase: SupabaseClient, organisationId: string, rule: BankRuleInput): Promise<string | null> {
	if (rule.matchedAs === BankRuleKinds.cost) {
		const cost = { expenseAccountId: rule.accountId, costCentreId: rule.costCentreId, amount: noAmount };
		return expenseTargetRefusal(supabase, organisationId, cost);
	}
	const accountIds = [rule.accountId];
	const accounts = await findOrganisationRecords(supabase, 'books_ledger_accounts', organisationId, accountIds);
	return unusableRecordRefusal('account', accountIds, accounts);
}

function setMeanwhileRefusal(rule: BankRuleInput): BooksRefusal {
	return new BooksRefusal(`A rule for ${rule.counterparty}, money ${rule.direction}, was set meanwhile; list_bank_rules says what it is now.`);
}
