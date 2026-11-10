import { hasEmployment, type TakeHomeInputs } from './takeHomeInputs';
import { estimateTakeHome, type TakeHomeEstimate } from './takeHomeEstimate';
import { taxYearNames } from './taxYearRules';
import type { TaxYearName } from './taxRuleTypes';

export type ExtraIncomeOutcome = {
	extraTakeHome: number;
	shareOfExtraKept: number;
};

export type TaxYearTakeHome = { taxYear: TaxYearName; takeHome: number };

export function outcomeOfEarningMore(estimate: TakeHomeEstimate, extraIncome: number): ExtraIncomeOutcome {
	if (extraIncome <= 0) return { extraTakeHome: 0, shareOfExtraKept: 0 };
	const withExtra = estimateTakeHome(inputsWithExtraIncome(estimate.inputs, extraIncome));
	const extraTakeHome = withExtra.takeHome - estimate.takeHome;
	return { extraTakeHome, shareOfExtraKept: extraTakeHome / extraIncome };
}

export function takeHomeByTaxYear(inputs: TakeHomeInputs): TaxYearTakeHome[] {
	return taxYearNames.map((taxYear) => ({ taxYear, takeHome: estimateTakeHome({ ...inputs, taxYear }).takeHome }));
}

function inputsWithExtraIncome(inputs: TakeHomeInputs, extraIncome: number): TakeHomeInputs {
	if (hasEmployment(inputs)) return { ...inputs, annualSalary: inputs.annualSalary + extraIncome };
	const trade = inputs.selfEmployment;
	const selfEmployment = { ...trade, annualIncome: trade.annualIncome + extraIncome };
	return { ...inputs, selfEmployment };
}
