import type { BreakdownRow, BreakdownScale } from './breakdownRow';
import { detail, line, total } from './breakdownRow';
import { selfEmploymentRows } from './selfEmploymentRows';
import type { TakeHomeEstimate } from './takeHomeEstimate';
import { deducted, formatMoney } from './taxCalculatorFormatting';

export function takeHomeBreakdown(estimate: TakeHomeEstimate, scale: BreakdownScale): BreakdownRow[] {
	return [
		...employmentRows(estimate, scale),
		...selfEmploymentRows(estimate.selfEmployment, scale),
		...deductionRows(estimate, scale),
		total('Your take-home', formatMoney(scale.of(estimate.takeHome)))
	];
}

function employmentRows(estimate: TakeHomeEstimate, scale: BreakdownScale): BreakdownRow[] {
	const { employment } = estimate;
	if (employment.grossPay <= 0) return [];
	const bonusRows = employment.bonus > 0 ? [line('Bonus', formatMoney(scale.of(employment.bonus)))] : [];
	return [line('Salary', formatMoney(scale.of(employment.salary))), ...bonusRows];
}

function deductionRows(estimate: TakeHomeEstimate, scale: BreakdownScale): BreakdownRow[] {
	const amountRow = (label: string, amount: number) => (amount > 0 ? [line(label, deducted(scale.of(amount)))] : []);
	return [
		line('Income tax', deducted(scale.of(estimate.incomeTaxTotal))),
		...amountRow('National Insurance (Class 1)', estimate.class1Total),
		...amountRow('National Insurance (Class 4)', estimate.class4Total),
		...estimate.studentLoans.flatMap((loan) => amountRow(loan.name, loan.amount)),
		...pensionRows(estimate, scale)
	];
}

function pensionRows(estimate: TakeHomeEstimate, scale: BreakdownScale): BreakdownRow[] {
	if (estimate.pensionCost <= 0) return [];
	const { employment } = estimate;
	const explanation =
		employment.pensionContribution > 0
			? 'Taken from your pay before income tax'
			: 'You pay this; the government adds basic-rate relief on top';
	return [line('Pension contributions', deducted(scale.of(estimate.pensionCost))), detail(explanation)];
}
