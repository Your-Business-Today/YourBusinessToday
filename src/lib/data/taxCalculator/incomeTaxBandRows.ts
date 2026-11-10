import type { BreakdownRow, BreakdownScale } from './breakdownRow';
import { detail, line, subtotal, total } from './breakdownRow';
import { isPersonalAllowanceTapered } from './highIncomeSignals';
import type { TakeHomeEstimate } from './takeHomeEstimate';
import { deducted, formatMoney, formatPercentage, formatWholePounds } from './taxCalculatorFormatting';

export function incomeTaxBandRows(estimate: TakeHomeEstimate, scale: BreakdownScale): BreakdownRow[] {
	const totalIncome = estimate.taxableIncome + estimate.personalAllowanceUsed;
	const { incomeTax } = estimate;
	const sliceRows = incomeTax.slices
		.filter((slice) => slice.amount > 0)
		.map((slice) =>
			line(
				`${slice.name}, ${formatPercentage(slice.rate)} on ${formatMoney(scale.of(slice.amount))}`,
				formatMoney(scale.of(slice.tax))
			)
		);
	return [
		line('Income taxed', formatMoney(scale.of(totalIncome))),
		line('Less: personal allowance', deducted(scale.of(estimate.personalAllowanceUsed))),
		...taperRows(estimate, scale),
		subtotal('Taxable income', formatMoney(scale.of(estimate.taxableIncome))),
		...sliceRows,
		total('Income tax', formatMoney(scale.of(estimate.incomeTaxTotal)))
	];
}

function taperRows(estimate: TakeHomeEstimate, scale: BreakdownScale): BreakdownRow[] {
	if (!scale.isYearly || !isPersonalAllowanceTapered(estimate)) return [];
	const { incomeTax: rules } = estimate.rules;
	return [
		detail(
			`Over ${formatWholePounds(rules.personalAllowanceTaperThreshold)}, the ${formatWholePounds(rules.personalAllowance)} allowance shrinks by £1 for every £2.`
		)
	];
}
