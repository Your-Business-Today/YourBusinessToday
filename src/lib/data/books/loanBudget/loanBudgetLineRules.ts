import { validateMonthKey } from '../monthKey';
import { LoanBudgetLimits, type LoanBudgetLineSettings, type LoanDrawSettings } from './loanBudget';
import { amountAboveNothingRule, checkGivenFields, givenNames, missingField, plainTextRule, type FieldRule } from './fieldRules';

const lineRules: Record<keyof LoanBudgetLineSettings, FieldRule> = {
	purpose: plainTextRule('purpose', LoanBudgetLimits.longestTitle),
	amount: amountAboveNothingRule('amount'),
	expectedReturn: plainTextRule('expectedReturn', LoanBudgetLimits.longestText)
};

const drawRules: Record<keyof LoanDrawSettings, FieldRule> = {
	month: (candidate) => validateMonthKey('month', candidate),
	amount: amountAboveNothingRule('amount')
};

const lineNames = Object.keys(lineRules) as (keyof LoanBudgetLineSettings)[];
const drawNames = Object.keys(drawRules) as (keyof LoanDrawSettings)[];

/** A new budget line as given, or the first reason it cannot be kept: every line says what it is for and its return. */
export function validateLoanBudgetLine(fields: Record<string, unknown>): LoanBudgetLineSettings | string {
	const missing = missingField(fields, lineNames);
	if (missing !== undefined) return `${missing} is needed; it was left out.`;
	return checkGivenFields(fields, lineRules, lineNames) as LoanBudgetLineSettings | string;
}

/** Only what the person gave to change of a line, each checked, or the first reason one cannot be kept. */
export function validateLoanBudgetLineChange(fields: Record<string, unknown>): Partial<LoanBudgetLineSettings> | string {
	const names = givenNames(fields, lineRules);
	if (names.length === 0) return `Give at least one of ${lineNames.join(', ')} to change; none was given.`;
	return checkGivenFields(fields, lineRules, names);
}

/** A draw of the loan as given, or the first reason it cannot be kept. */
export function validateLoanDraw(fields: Record<string, unknown>): LoanDrawSettings | string {
	const missing = missingField(fields, drawNames);
	if (missing !== undefined) return `${missing} is needed; it was left out.`;
	return checkGivenFields(fields, drawRules, drawNames) as LoanDrawSettings | string;
}
