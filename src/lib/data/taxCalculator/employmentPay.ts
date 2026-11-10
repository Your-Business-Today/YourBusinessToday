import { roundToPence } from '$lib/data/books/money';
import { hasEmployment, type TakeHomeInputs } from './takeHomeInputs';

export type EmploymentPay = {
	salary: number;
	bonus: number;
	grossPay: number;
	pensionContribution: number;
	taxablePay: number;
};

const percent = 100;

export function employmentPayFor(inputs: TakeHomeInputs): EmploymentPay {
	if (!hasEmployment(inputs)) return { salary: 0, bonus: 0, grossPay: 0, pensionContribution: 0, taxablePay: 0 };
	const grossPay = roundToPence(inputs.annualSalary + inputs.annualBonus);
	const pensionContribution = roundToPence((grossPay * inputs.pensionPercentage) / percent);
	return {
		salary: inputs.annualSalary,
		bonus: inputs.annualBonus,
		grossPay,
		pensionContribution,
		taxablePay: roundToPence(grossPay - pensionContribution)
	};
}
