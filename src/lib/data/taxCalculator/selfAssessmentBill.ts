import { roundToPence } from '$lib/data/books/money';
import { incomeTaxOnPayAlone } from './incomeTax';
import { repayStudentLoans, totalOf } from './studentLoans';
import type { TakeHomeEstimate } from './takeHomeEstimate';

export type SelfAssessmentOutcome = 'taxDue' | 'refund' | 'loss';
export const selfAssessmentOutcomes = { taxDue: 'taxDue', refund: 'refund', loss: 'loss' } as const satisfies Record<SelfAssessmentOutcome, SelfAssessmentOutcome>;

export type SelfAssessmentBill = {
	profit: number;
	incomeTax: number;
	class4: number;
	studentLoan: number;
	cisDeductions: number;
	taxCollectedAtSource: number;
	incomeTaxAndClass4: number;
	balanceDue: number;
	outcome: SelfAssessmentOutcome;
};

export function selfAssessmentBillFor(estimate: Omit<TakeHomeEstimate, 'selfAssessment'>): SelfAssessmentBill | null {
	const { selfEmployment, employment, rules, inputs } = estimate;
	if (selfEmployment === null) return null;
	const incomeTaxThroughPayroll = incomeTaxOnPayAlone(employment.taxablePay, estimate.bands, rules.incomeTax);
	const studentLoanThroughPayroll = totalOf(
		repayStudentLoans(employment.grossPay, inputs.studentLoans, rules.studentLoans)
	);
	const incomeTax = roundToPence(estimate.incomeTaxTotal - incomeTaxThroughPayroll);
	const studentLoan = roundToPence(totalOf(estimate.studentLoans) - studentLoanThroughPayroll);
	const balanceDue = roundToPence(incomeTax + estimate.class4Total + studentLoan - selfEmployment.cisDeductions);
	return {
		profit: selfEmployment.profit,
		incomeTax,
		class4: estimate.class4Total,
		studentLoan,
		cisDeductions: selfEmployment.cisDeductions,
		taxCollectedAtSource: roundToPence(incomeTaxThroughPayroll + selfEmployment.cisDeductions),
		incomeTaxAndClass4: roundToPence(estimate.incomeTaxTotal + estimate.class4Total),
		balanceDue,
		outcome: outcomeOf(selfEmployment.profit, balanceDue)
	};
}

function outcomeOf(profit: number, balanceDue: number): SelfAssessmentOutcome {
	if (profit < 0) return 'loss';
	if (balanceDue < 0) return 'refund';
	return 'taxDue';
}
