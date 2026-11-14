import type { SupabaseClient } from '@supabase/supabase-js';
import type { BankRule } from './bankRules';
import { findOrganisationRecords, type BooksRecord } from './organisationRecords';

type NamedRecord = BooksRecord & { name: string; code?: string };

/** The accounts and cost centres the rules name, each by its id: an account by code and name, archived ones marked. */
export async function findRuleTargetNames(supabase: SupabaseClient, organisationId: string, rules: BankRule[]): Promise<Map<string, string>> {
	const accountIds = [...new Set(rules.map((rule) => rule.accountId))];
	const costCentreIds = [...new Set(rules.flatMap((rule) => (rule.costCentreId === null ? [] : [rule.costCentreId])))];
	const accounts = await findOrganisationRecords<NamedRecord>(supabase, 'books_ledger_accounts', organisationId, accountIds, 'id, is_archived, code, name');
	const costCentres = await findOrganisationRecords<NamedRecord>(supabase, 'books_cost_centres', organisationId, costCentreIds, 'id, is_archived, name');
	return new Map([...accounts, ...costCentres].map((record) => [record.id, nameOf(record)]));
}

function nameOf(record: NamedRecord): string {
	const named = record.code === undefined ? record.name : `${record.code} ${record.name}`;
	if (record.is_archived === true) return `${named} (archived, so the rule matches nothing until it is set on another)`;
	return named;
}
