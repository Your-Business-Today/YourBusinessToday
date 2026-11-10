import type { BandSlice } from './bandSlice';
import type { BreakdownRow, BreakdownScale } from './breakdownRow';
import { line, total } from './breakdownRow';
import type { TakeHomeEstimate } from './takeHomeEstimate';
import { formatMoney, formatPercentage } from './taxCalculatorFormatting';

export function nationalInsuranceRows(estimate: TakeHomeEstimate, scale: BreakdownScale): BreakdownRow[] {
	const { class1, class4 } = estimate;
	const nationalInsurance = class1.total + class4.total;
	if (nationalInsurance <= 0) return [];
	return [
		...sliceRows('Class 1', [class1.mainRate, class1.additionalRate], scale),
		...sliceRows('Class 4', [class4.mainRate, class4.additionalRate], scale),
		total('National Insurance', formatMoney(scale.of(nationalInsurance)))
	];
}

function sliceRows(className: string, slices: BandSlice[], scale: BreakdownScale): BreakdownRow[] {
	return slices
		.filter((slice) => slice.amount > 0)
		.map((slice) =>
			line(
				`${className}, ${formatPercentage(slice.rate)} on ${formatMoney(scale.of(slice.amount))}`,
				formatMoney(scale.of(slice.tax))
			)
		);
}
