import type { SupabaseClient } from '@supabase/supabase-js';
import { BankRuleKinds, findCoveringRule } from '$lib/data/books/bankRuleTerms';
import { BooksRefusal } from './booksRefusal';
import type { BankLine } from './bankLines';
import type { BankRule } from './bankRules';
import { matchBankLine, type MatchedBy } from './matchBankLine';

/** A line a rule matched, and what it was matched as in the person's words. */
export type RuleMatch = { line: BankLine; whatItWas: string };

/** A line a rule covers that could not be matched, and why, such as the rule's account having been archived since. */
export type RuleRefusal = { line: BankLine; reason: string };

/** What the rules did to the lines they were given: those matched, those refused, and how many of the lines are left unmatched. */
export type RulesApplied = { matched: RuleMatch[]; refused: RuleRefusal[]; leftCount: number };

/**
 * Matches each of the lines a rule covers as its rule says, one at a time through the same match a person makes by hand,
 * so each is posted and tied in one step of the database. A line no rule covers is left; a line its rule cannot match is
 * left with the reason, and the rest go on.
 */
export async function applyBankRules(
	supabase: SupabaseClient,
	organisationId: string,
	matchedBy: MatchedBy,
	lines: BankLine[],
	rules: BankRule[]
): Promise<RulesApplied> {
	const matched: RuleMatch[] = [];
	const refused: RuleRefusal[] = [];
	for (const line of lines) {
		const rule = findCoveringRule(rules, line);
		if (rule === undefined) continue;
		const outcome = await matchByRule(supabase, organisationId, matchedBy, line, rule);
		if (typeof outcome === 'string') {
			refused.push({ line, reason: outcome });
			continue;
		}
		matched.push(outcome);
	}
	return { matched, refused, leftCount: lines.length - matched.length };
}

async function matchByRule(
	supabase: SupabaseClient,
	organisationId: string,
	matchedBy: MatchedBy,
	line: BankLine,
	rule: BankRule
): Promise<RuleMatch | string> {
	try {
		const match = await matchBankLine(supabase, organisationId, matchedBy, { bankLineId: line.id, ...whatTheRuleSays(rule) });
		return { line, whatItWas: match.whatItWas };
	} catch (failure) {
		if (failure instanceof BooksRefusal) return failure.message;
		throw failure;
	}
}

function whatTheRuleSays(rule: BankRule): Record<string, unknown> {
	const { accountId, description, costCentreId } = rule;
	if (rule.matchedAs === BankRuleKinds.account) return { account: { accountId, description } };
	const withinCostCentre = costCentreId === null ? {} : { costCentreId };
	return { cost: { expenseAccountId: accountId, description, ...withinCostCentre } };
}
