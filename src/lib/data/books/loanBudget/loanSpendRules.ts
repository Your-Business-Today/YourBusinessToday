import { validateRecordId } from '$lib/data/isUuid';
import { validateIsoDate } from '../isoDate';
import { LoanBudgetLimits, type LoanSpendSettings } from './loanBudget';
import { amountAboveNothingRule, checkGivenFields, missingField, plainTextRule, type FieldRule } from './fieldRules';

type GivenSpend = Omit<LoanSpendSettings, 'expenseId'>;

const spendRules: Record<keyof GivenSpend, FieldRule> = {
	spentOn: (candidate) => validateIsoDate('spentOn', candidate),
	amount: amountAboveNothingRule('amount'),
	description: plainTextRule('description', LoanBudgetLimits.longestTitle)
};

const spendNames = Object.keys(spendRules) as (keyof GivenSpend)[];

/** A spend as given, or the first reason it cannot be kept: the cost it matches is optional, and by its id when given. */
export function validateLoanSpend(fields: Record<string, unknown>): LoanSpendSettings | string {
	const missing = missingField(fields, spendNames);
	if (missing !== undefined) return `${missing} is needed; it was left out.`;
	const spend = checkGivenFields(fields, spendRules, spendNames);
	if (typeof spend === 'string') return spend;
	const isExpenseGiven = fields.expenseId !== undefined && fields.expenseId !== null;
	if (!isExpenseGiven) return { ...(spend as GivenSpend), expenseId: null };
	const expenseRefusal = validateRecordId('expense', String(fields.expenseId));
	return expenseRefusal ?? { ...(spend as GivenSpend), expenseId: String(fields.expenseId) };
}
