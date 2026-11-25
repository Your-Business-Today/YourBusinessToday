import { validateMonthKey } from '../monthKey';
import { LoanBudgetLimits, type LoanBudgetSettings } from './loanBudget';
import { amountAboveNothingRule, anyTextRule, checkGivenFields, givenNames, missingField, plainTextRule, type FieldRule } from './fieldRules';

const { longestTitle, longestName, longestText, mostRepaymentMonths } = LoanBudgetLimits;

const loanBudgetRules: Record<keyof LoanBudgetSettings, FieldRule> = {
	title: plainTextRule('title', longestTitle),
	loanAmount: amountAboveNothingRule('loanAmount'),
	repaidTo: plainTextRule('repaidTo', longestName),
	monthlyRepayment: amountAboveNothingRule('monthlyRepayment'),
	firstRepaymentMonth: (candidate) => validateMonthKey('firstRepaymentMonth', candidate),
	repaymentMonths: repaymentMonthsRefusal,
	notes: anyTextRule('notes', longestText)
};

const requiredSettings = ['title', 'loanAmount', 'repaidTo', 'monthlyRepayment', 'firstRepaymentMonth', 'repaymentMonths'];

export const nothingToChange = `Give at least one of ${Object.keys(loanBudgetRules).join(', ')} to change; none was given.`;

/** The loan budget as given, or the first reason it cannot be kept: never trimmed, rounded or filled in beyond no notes. */
export function validateLoanBudget(fields: Record<string, unknown>): LoanBudgetSettings | string {
	const missing = missingField(fields, requiredSettings);
	if (missing !== undefined) return `${missing} is needed; it was left out.`;
	const withNotes = { ...fields, notes: fields.notes ?? '' };
	return checkGivenFields(withNotes, loanBudgetRules, Object.keys(loanBudgetRules) as (keyof LoanBudgetSettings)[]) as LoanBudgetSettings | string;
}

/** Only the settings the person gave to change, each checked, or the first reason one cannot be kept. */
export function validateLoanBudgetChange(fields: Record<string, unknown>): Partial<LoanBudgetSettings> | string {
	const names = givenNames(fields, loanBudgetRules);
	if (names.length === 0) return nothingToChange;
	return checkGivenFields(fields, loanBudgetRules, names);
}

function repaymentMonthsRefusal(candidate: unknown): string | null {
	const isWholeMonths = Number.isInteger(candidate) && (candidate as number) >= 1 && (candidate as number) <= mostRepaymentMonths;
	if (isWholeMonths) return null;
	return `repaymentMonths is a whole number of months from 1 to ${mostRepaymentMonths}; ${JSON.stringify(candidate)} was given.`;
}
