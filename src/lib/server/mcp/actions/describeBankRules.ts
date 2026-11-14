import { BankRuleDirections, BankRuleKinds, type BankRuleDirection } from '$lib/data/books/bankRuleTerms';
import type { BankRule } from '$lib/server/books/bankRules';
import type { RulesApplied } from '$lib/server/books/applyBankRules';
import type { SetBankRule } from '$lib/server/books/setBankRule';
import { bankLineKnownAs } from '$lib/server/books/heldBankLine';

const directionInWords: Record<BankRuleDirection, string> = {
	[BankRuleDirections.in]: 'money in',
	[BankRuleDirections.out]: 'money out',
	[BankRuleDirections.either]: 'money in or out'
};

const none = 0;
const leftOut = '';

/** The rule in the person's terms: whose lines, which way, and what they always are. */
export function describeBankRule(rule: BankRule, names: Map<string, string>): string {
	const account = names.get(rule.accountId) ?? rule.accountId;
	const described = rule.description === leftOut ? '' : `, "${rule.description}"`;
	const lines = `Lines from ${rule.counterparty}, ${directionInWords[rule.direction]}`;
	if (rule.matchedAs === BankRuleKinds.account) return `${lines}, are money moving to or from ${account}${described}`;
	const costCentre = rule.costCentreId === null ? '' : `, within ${names.get(rule.costCentreId) ?? rule.costCentreId}`;
	return `${lines}, are a cost on ${account}${described}${costCentre}`;
}

/** The organisation's rules, each with its id. */
export function describeBankRuleList(organisationName: string, rules: BankRule[], names: Map<string, string>): string {
	if (rules.length === none) return `${organisationName}'s books hold no bank rules yet; set_bank_rule sets one.`;
	const listed = rules.map((rule) => `- ${describeBankRule(rule, names)}. Id ${rule.id}`);
	return [`Bank rules of ${organisationName}, ${rules.length} in all:`, ...listed].join('\n');
}

/** What setting the rule did: the rule, the one it replaced, and the lines it matched when asked to. */
export function describeBankRuleSet(organisationName: string, set: SetBankRule & { applied: RulesApplied | null }, names: Map<string, string>): string {
	const { rule, replaced, applied } = set;
	const opening = `Set in ${organisationName}'s books: ${describeBankRule(rule, names)}. Id ${rule.id}.`;
	const replacing = replaced === null ? [] : [`It replaces: ${describeBankRule(replaced, names)}.`];
	const work = applied === null ? ['No line was matched now; the rule matches the next statement brought in with applyRules.'] : describeRuleWork(applied);
	return [opening, ...replacing, ...work].join('\n');
}

/** What the rules matched among the statement's lines and what is left for the person's Claude to match. */
export function describeRulesOnImport(applied: RulesApplied | null): string {
	if (applied === null) return 'The rules were not applied; match_bank_line matches each line.';
	const left = `${applied.leftCount} left unmatched in the statement's days, for match_bank_line.`;
	return [...describeRuleWork(applied), left].join('\n');
}

function describeRuleWork(applied: RulesApplied): string[] {
	const { matched, refused } = applied;
	if (matched.length === none && refused.length === none) return ['No unmatched line a rule covers was there to match.'];
	const matchedLines = matched.map((match) => `- the line ${bankLineKnownAs(match.line)}, as ${match.whatItWas}`);
	const refusedLines = refused.map((refusal) => `- the line ${bankLineKnownAs(refusal.line)}: ${refusal.reason}`);
	const matchedPart = matched.length === none ? [] : [`The rules matched ${matched.length}, each posted on its line's day:`, ...matchedLines];
	const refusedPart = refused.length === none ? [] : [`${refused.length} a rule covers could not be matched, and are left:`, ...refusedLines];
	return [...matchedPart, ...refusedPart];
}
