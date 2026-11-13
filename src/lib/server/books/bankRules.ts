import type { SupabaseClient } from '@supabase/supabase-js';
import { validateRecordId } from '$lib/data/isUuid';
import type { BankRuleInput } from '$lib/data/books/bankRuleRules';
import type { BankRuleDirection, BankRuleKind } from '$lib/data/books/bankRuleTerms';
import { BooksRefusal, refuseWhen } from './booksRefusal';

/** A rule the books keep: whose lines it covers, which way, and what such a line always is. */
export type BankRule = BankRuleInput & { id: string };

export type BankRuleRow = {
	id: string;
	counterparty: string;
	direction: BankRuleDirection;
	matched_as: BankRuleKind;
	account_id: string;
	description: string;
	cost_centre_id: string | null;
};

export const bankRulesTable = 'books_bank_rules';

export const bankRuleColumns = 'id, counterparty, direction, matched_as, account_id, description, cost_centre_id';

/** Every rule of the organisation, by counterparty. */
export async function findBankRules(supabase: SupabaseClient, organisationId: string): Promise<BankRule[]> {
	const { data, error } = await supabase.from(bankRulesTable).select(bankRuleColumns).eq('organisation_id', organisationId).order('counterparty');
	if (error !== null) throw error;
	return (data as unknown as BankRuleRow[]).map(fromBankRuleRow);
}

/** Takes the rule out of the books, refused by name when it is not one of the organisation's; the lines it matched stay matched. */
export async function deleteBankRule(supabase: SupabaseClient, organisationId: string, bankRuleId: unknown): Promise<BankRule> {
	refuseWhen(validateRecordId('bank rule', String(bankRuleId ?? '')));
	const { data, error } = await supabase
		.from(bankRulesTable)
		.delete()
		.eq('organisation_id', organisationId)
		.eq('id', bankRuleId)
		.select(bankRuleColumns)
		.maybeSingle();
	if (error !== null) throw error;
	if (data === null) throw new BooksRefusal(`No bank rule ${bankRuleId} is in this organisation's books; list_bank_rules lists them.`);
	return fromBankRuleRow(data as unknown as BankRuleRow);
}

/** The columns a rule is written with. */
export function bankRuleRow(rule: BankRuleInput) {
	return {
		counterparty: rule.counterparty,
		direction: rule.direction,
		matched_as: rule.matchedAs,
		account_id: rule.accountId,
		description: rule.description,
		cost_centre_id: rule.costCentreId
	};
}

/** The rule a row of books_bank_rules holds. */
export function fromBankRuleRow(row: BankRuleRow): BankRule {
	return {
		id: row.id,
		counterparty: row.counterparty,
		direction: row.direction,
		matchedAs: row.matched_as,
		accountId: row.account_id,
		description: row.description,
		costCentreId: row.cost_centre_id
	};
}
