import type { TakeHomeEstimate } from './takeHomeEstimate';

export function isPersonalAllowanceTapered(estimate: TakeHomeEstimate): boolean {
	const { incomeTax } = estimate.rules;
	return estimate.adjustedNetIncome > incomeTax.personalAllowanceTaperThreshold;
}

export function isPayingHigherRates(estimate: TakeHomeEstimate): boolean {
	const { incomeTax } = estimate;
	return incomeTax.slices.some((slice) => slice.isHigherRate && slice.amount > 0);
}

export function effectiveTaxRate(estimate: TakeHomeEstimate): number | null {
	if (estimate.grossEarnings <= 0) return null;
	return (estimate.incomeTaxTotal + estimate.nationalInsuranceTotal) / estimate.grossEarnings;
}

export function shareKept(estimate: TakeHomeEstimate): number {
	if (estimate.grossEarnings <= 0) return 0;
	return Math.max(0, estimate.takeHome) / estimate.grossEarnings;
}
