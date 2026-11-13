import { validateRecordId } from '$lib/data/isUuid';
import { BankRuleDirections, BankRuleKinds, type BankRuleDirection, type BankRuleKind } from './bankRuleTerms';

/** The limits of books_bank_rules (migration 0226). */
export const bankRuleLimits = { counterpartyLength: 200, descriptionLength: 300 } as const;

/** A rule as the person gave it: whose lines it covers, which way the money moves, and what such a line always is. */
export type BankRuleInput = {
	counterparty: string;
	direction: BankRuleDirection;
	matchedAs: BankRuleKind;
	accountId: string;
	description: string;
	costCentreId: string | null;
};

type WhatItIs = Pick<BankRuleInput, 'matchedAs' | 'accountId' | 'description' | 'costCentreId'>;

const leftOut = '';
const kindFields = Object.values(BankRuleKinds);
const directions = Object.values(BankRuleDirections) as string[];
const exactlyOne = 1;

/** The rule as given, or the first reason its columns cannot hold it, named by its field: never trimmed or filled in. */
export function validateBankRule(fields: Record<string, unknown>): BankRuleInput | string {
	const refusal = counterpartyRefusal(fields.counterparty) ?? directionRefusal(fields.direction);
	if (refusal !== null) return refusal;
	const whatItIs = validateWhatItIs(fields);
	if (typeof whatItIs === 'string') return whatItIs;
	const direction = fields.direction as BankRuleDirection;
	const isCostOnMoneyOut = whatItIs.matchedAs !== BankRuleKinds.cost || direction === BankRuleDirections.out;
	if (!isCostOnMoneyOut) return `A cost is money out, so a cost rule's direction is out; ${direction} was given.`;
	return { counterparty: fields.counterparty as string, direction, ...whatItIs };
}

function validateWhatItIs(fields: Record<string, unknown>): WhatItIs | string {
	const given = kindFields.filter((field) => fields[field] !== undefined);
	if (given.length !== exactlyOne) return `Give exactly one of cost or account, saying what the lines always are; ${given.length} were given.`;
	const [kind] = given;
	const details = fields[kind];
	const isObject = typeof details === 'object' && details !== null && !Array.isArray(details);
	if (!isObject) return `${kind} is an object holding what the lines always are; ${JSON.stringify(details)} was given.`;
	if (kind === BankRuleKinds.cost) return validateCost(details as Record<string, unknown>);
	return validateMovement(details as Record<string, unknown>);
}

function validateCost(details: Record<string, unknown>): WhatItIs | string {
	const costCentreId = details.costCentreId;
	const refusal =
		validateRecordId('expense account', String(details.expenseAccountId ?? leftOut)) ??
		descriptionRefusal(details.description ?? leftOut) ??
		(costCentreId === undefined ? null : validateRecordId('cost centre', String(costCentreId)));
	if (refusal !== null) return refusal;
	return {
		matchedAs: BankRuleKinds.cost,
		accountId: details.expenseAccountId as string,
		description: (details.description ?? leftOut) as string,
		costCentreId: (costCentreId ?? null) as string | null
	};
}

function validateMovement(details: Record<string, unknown>): WhatItIs | string {
	const isDescribed = typeof details.description === 'string' && details.description.trim() !== leftOut;
	if (!isDescribed) return 'account.description is needed: what the movement is, such as Loan from James.';
	const refusal = validateRecordId('account', String(details.accountId ?? leftOut)) ?? descriptionRefusal(details.description);
	if (refusal !== null) return refusal;
	return { matchedAs: BankRuleKinds.account, accountId: details.accountId as string, description: details.description as string, costCentreId: null };
}

function counterpartyRefusal(counterparty: unknown): string | null {
	const isNamed = typeof counterparty === 'string' && counterparty.trim() !== leftOut;
	if (!isNamed) return 'counterparty is needed: who the money comes from or goes to, as the statement names them.';
	return lengthRefusal('counterparty', counterparty, bankRuleLimits.counterpartyLength);
}

function directionRefusal(direction: unknown): string | null {
	if (directions.includes(direction as string)) return null;
	return `direction is one of ${directions.join(', ')}; ${JSON.stringify(direction)} was given.`;
}

function descriptionRefusal(description: unknown): string | null {
	if (typeof description !== 'string') return `description is text; ${JSON.stringify(description)} was given.`;
	return lengthRefusal('description', description, bankRuleLimits.descriptionLength);
}

function lengthRefusal(field: string, value: string, longest: number): string | null {
	const characterCount = [...value].length;
	if (characterCount <= longest) return null;
	return `${field} is at most ${longest} characters; ${characterCount} were given.`;
}
