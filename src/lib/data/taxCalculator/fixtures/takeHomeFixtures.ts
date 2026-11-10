import { class2PositionFor } from '../class2Position';
import { paymentsOnAccountFor } from '../paymentsOnAccount';
import type { SelfAssessmentBill } from '../selfAssessmentBill';
import type { TakeHomeEstimate } from '../takeHomeEstimate';
import type { TakeHomeInputs } from '../takeHomeInputs';
import type { TaxYearRules } from '../taxRuleTypes';
import type { FixtureSelfAssessment, TakeHomeFixtureCase, TakeHomeFixtureFile, TakeHomeOutcome } from './takeHomeFixtureTypes';
import taxYear2025To2026 from './taxYear2025To2026.json';
import taxYear2026To2027 from './taxYear2026To2027.json';

export const takeHomeFixtureFiles = [taxYear2025To2026, taxYear2026To2027] as TakeHomeFixtureFile[];

export function inputsFor(file: TakeHomeFixtureFile, fixtureCase: TakeHomeFixtureCase): TakeHomeInputs {
	const { defaultInputs } = file;
	const { inputs } = fixtureCase;
	return {
		...defaultInputs,
		...inputs,
		taxYear: file.taxYear,
		studentLoans: { ...defaultInputs.studentLoans, ...inputs.studentLoans },
		selfEmployment: { ...defaultInputs.selfEmployment, ...inputs.selfEmployment }
	};
}

export function outcomeOf(estimate: TakeHomeEstimate): TakeHomeOutcome {
	const { selfEmployment, selfAssessment } = estimate;
	return {
		personalAllowance: estimate.personalAllowanceUsed,
		taxableIncome: estimate.taxableIncome,
		incomeTax: estimate.incomeTaxTotal,
		class1: estimate.class1Total,
		class4: estimate.class4Total,
		studentLoans: estimate.studentLoans.map((repayment) => repayment.amount),
		pensionCost: estimate.pensionCost,
		takeHome: estimate.takeHome,
		profit: selfEmployment?.profit ?? null,
		usesTradingAllowance: selfEmployment?.usesTradingAllowance ?? null,
		...selfAssessmentOutcomeOf(selfAssessment, estimate.rules)
	};
}

function selfAssessmentOutcomeOf(bill: SelfAssessmentBill | null, rules: TaxYearRules) {
	if (bill === null) return { selfAssessment: null, paymentsOnAccount: null, class2: null };
	const paymentsOnAccount = paymentsOnAccountFor(bill, rules);
	const { nationalInsurance } = rules;
	return {
		selfAssessment: selfAssessmentFiguresOf(bill),
		paymentsOnAccount: paymentsOnAccount?.eachPayment ?? null,
		class2: class2PositionFor(bill, nationalInsurance)
	};
}

function selfAssessmentFiguresOf(bill: SelfAssessmentBill): FixtureSelfAssessment {
	const { incomeTax, class4, studentLoan, cisDeductions, balanceDue, outcome } = bill;
	return { incomeTax, class4, studentLoan, cisDeductions, balanceDue, outcome };
}
