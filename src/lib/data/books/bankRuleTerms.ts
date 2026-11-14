/** Which way the money on a line a rule covers moves, as books_bank_rules.direction holds it (migration 0226). */
export const BankRuleDirections = { in: 'in', out: 'out', either: 'either' } as const;

export type BankRuleDirection = (typeof BankRuleDirections)[keyof typeof BankRuleDirections];

/** What a line a rule covers always is, as books_bank_rules.matched_as holds it: never an invoice payment. */
export const BankRuleKinds = { cost: 'cost', account: 'account' } as const;

export type BankRuleKind = (typeof BankRuleKinds)[keyof typeof BankRuleKinds];

/** What a rule is matched against: whose line it is and which way it moves. */
export type RuleCover = { counterparty: string; direction: BankRuleDirection };

const spacesAtTheEnds = /^ +| +$/g;
const nothing = 0;

/** The counterparty as rules match it: whole, ignoring case and the spaces at its ends, as counterparty_key holds it. */
export function counterpartyKey(counterparty: string): string {
	return counterparty.replace(spacesAtTheEnds, '').toLowerCase();
}

/** The rule that covers a line from that counterparty of that amount: one for its own direction before one for either. */
export function findCoveringRule<Rule extends RuleCover>(rules: Rule[], line: { counterparty: string; amount: number }): Rule | undefined {
	const key = counterpartyKey(line.counterparty);
	const direction = line.amount > nothing ? BankRuleDirections.in : BankRuleDirections.out;
	const forTheCounterparty = rules.filter((rule) => counterpartyKey(rule.counterparty) === key);
	const forTheDirection = forTheCounterparty.find((rule) => rule.direction === direction);
	return forTheDirection ?? forTheCounterparty.find((rule) => rule.direction === BankRuleDirections.either);
}

/** The rule already kept for the same counterparty and direction, which a rule set again replaces. */
export function findSameRule<Rule extends RuleCover>(rules: Rule[], cover: RuleCover): Rule | undefined {
	const key = counterpartyKey(cover.counterparty);
	return rules.find((rule) => counterpartyKey(rule.counterparty) === key && rule.direction === cover.direction);
}

/** Why a choice the person's Claude always states is not true or false, or null when it is. */
export function statedChoiceRefusal(field: string, value: unknown): string | null {
	if (typeof value === 'boolean') return null;
	return `${field} is true or false, always stated; ${JSON.stringify(value)} was given.`;
}
