import { roundToPence } from '$lib/data/books/money';
import type { LoanRepayment, StudentLoanRules, UndergraduateLoanPlan } from './taxRuleTypes';

export type StudentLoanSelection = {
	undergraduatePlan: UndergraduateLoanPlan | null;
	hasPostgraduateLoan: boolean;
};

export type StudentLoanRepayment = {
	name: string;
	threshold: number;
	rate: number;
	amount: number;
};

export const undergraduatePlanNames: Record<UndergraduateLoanPlan, string> = {
	plan1: 'Plan 1',
	plan2: 'Plan 2',
	plan4: 'Plan 4',
	plan5: 'Plan 5'
};

export function repayStudentLoans(
	income: number,
	selection: StudentLoanSelection,
	rules: StudentLoanRules
): StudentLoanRepayment[] {
	const repayments = [
		undergraduateRepayment(income, selection.undergraduatePlan, rules),
		selection.hasPostgraduateLoan ? repaymentOn(income, 'Postgraduate loan', rules.postgraduate) : null
	];
	return repayments.filter((repayment) => repayment !== null);
}

export function totalOf(repayments: StudentLoanRepayment[]): number {
	return roundToPence(repayments.reduce((total, repayment) => total + repayment.amount, 0));
}

function repaymentOn(income: number, name: string, loan: LoanRepayment): StudentLoanRepayment {
	const amount = roundToPence(Math.max(0, income - loan.threshold) * loan.rate);
	return { name, threshold: loan.threshold, rate: loan.rate, amount };
}

function undergraduateRepayment(
	income: number,
	plan: UndergraduateLoanPlan | null,
	rules: StudentLoanRules
): StudentLoanRepayment | null {
	if (plan === null) return null;
	const loan = rules.undergraduatePlans[plan];
	if (loan === undefined) return null;
	return repaymentOn(income, `${undergraduatePlanNames[plan]} student loan`, loan);
}
