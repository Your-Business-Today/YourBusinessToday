import { roundToPence } from '$lib/data/books/money';
import type { BandSlice } from './bandSlice';
import { sumOfSlices } from './bandSlice';
import type { DividendRules } from './companyRuleTypes';
import type { TaxBand } from './taxRuleTypes';

export type DividendTaxCalculation = {
	taxableDividends: number;
	allowanceUsed: number;
	slices: BandSlice[];
	total: number;
};

type IncomeRange = { from: number; to: number };

export function dividendTaxFor(
	taxableDividends: number,
	taxableIncomeBelowDividends: number,
	ukBands: TaxBand[],
	rules: DividendRules
): DividendTaxCalculation {
	const allowanceUsed = Math.min(taxableDividends, rules.allowance);
	const taxed = { from: taxableIncomeBelowDividends + allowanceUsed, to: taxableIncomeBelowDividends + taxableDividends };
	const rates = [rules.ordinaryRate, rules.upperRate, rules.additionalRate];
	const slices = ukBands.map((band, bandIndex) => {
		const bandRange = { from: band.startsAt, to: ukBands[bandIndex + 1]?.startsAt ?? Number.POSITIVE_INFINITY };
		return sliceOfRange(taxed, bandRange, rates[bandIndex]);
	});
	return { taxableDividends, allowanceUsed, slices, total: sumOfSlices(slices) };
}

function sliceOfRange(taxed: IncomeRange, band: IncomeRange, rate: number): BandSlice {
	const amount = roundToPence(Math.max(0, Math.min(taxed.to, band.to) - Math.max(taxed.from, band.from)));
	return { amount, rate, tax: roundToPence(amount * rate) };
}
