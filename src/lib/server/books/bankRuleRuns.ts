import type { SupabaseClient } from '@supabase/supabase-js';
import { findCoveringRule, statedChoiceRefusal } from '$lib/data/books/bankRuleTerms';
import { refuseWhen } from './booksRefusal';
import { BankLineMatchings, findBankLines, findUnmatchedBankLines, type BankLine } from './bankLines';
import { findBankRules, type BankRule } from './bankRules';
import { setBankRule, type SetBankRule } from './setBankRule';
import { importBankLines, type BankLineImport } from './importBankLines';
import { applyBankRules, type RulesApplied } from './applyBankRules';
import type { MatchedBy } from './matchBankLine';

/** What the rules did, or null when they were not asked to apply. */
export type WhatRulesDid = { applied: RulesApplied | null };

/**
 * Sets the rule and, when applyNow is true, matches every line still unmatched that the rule now covers, on whichever
 * account. Setting it again matches nothing more, since the lines it matched are matched already.
 */
export async function setBankRuleAndApply(
	supabase: SupabaseClient,
	organisationId: string,
	setBy: MatchedBy,
	fields: Record<string, unknown>
): Promise<SetBankRule & WhatRulesDid> {
	refuseWhen(statedChoiceRefusal('applyNow', fields.applyNow));
	const set = await setBankRule(supabase, organisationId, setBy, fields);
	if (fields.applyNow === false) return { ...set, applied: null };
	const rules = await findBankRules(supabase, organisationId);
	const unmatched = await findUnmatchedBankLines(supabase, organisationId);
	const { rule } = set;
	const covered = unmatched.filter((line) => isCoveredBy(rule, rules, line));
	return { ...set, applied: await applyBankRules(supabase, organisationId, setBy, covered, rules) };
}

function isCoveredBy(rule: BankRule, rules: BankRule[], line: BankLine): boolean {
	const covering = findCoveringRule(rules, line);
	return covering?.id === rule.id;
}

/**
 * Brings the statement's lines in and, when applyRules is true, matches by the books' rules every line still unmatched
 * on its account between its first day and its last, so what is left is what the person's Claude matches by hand.
 */
export async function importStatementApplyingRules(
	supabase: SupabaseClient,
	organisationId: string,
	importedBy: MatchedBy,
	fields: Record<string, unknown>
): Promise<BankLineImport & WhatRulesDid> {
	refuseWhen(statedChoiceRefusal('applyRules', fields.applyRules));
	const imported = await importBankLines(supabase, organisationId, fields);
	if (fields.applyRules === false) return { ...imported, applied: null };
	const { account, firstDate, lastDate } = imported;
	const query = { bankAccountId: account.id, from: firstDate, to: lastDate, matching: BankLineMatchings.unmatched };
	const unmatched = await findBankLines(supabase, organisationId, query);
	const rules = await findBankRules(supabase, organisationId);
	return { ...imported, applied: await applyBankRules(supabase, organisationId, importedBy, unmatched, rules) };
}
