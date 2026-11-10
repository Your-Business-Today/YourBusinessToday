import { sliceBetween, sumOfSlices, type BandSlice } from './bandSlice';
import type { IncomeTaxRules, TaxBand } from './taxRuleTypes';

export type IncomeTaxSlice = BandSlice & { name: string; isHigherRate: boolean };

export type IncomeTaxCalculation = {
	slices: IncomeTaxSlice[];
	total: number;
};

const poundsOfIncomePerPoundOfAllowanceLost = 2;

export function fullPersonalAllowanceFor(adjustedNetIncome: number, rules: IncomeTaxRules): number {
	const incomeOverTaperThreshold = Math.max(0, adjustedNetIncome - rules.personalAllowanceTaperThreshold);
	const allowanceLost = Math.floor(incomeOverTaperThreshold / poundsOfIncomePerPoundOfAllowanceLost);
	return Math.max(0, rules.personalAllowance - allowanceLost);
}

export function bandsExtendedByPensionRelief(
	bands: TaxBand[],
	grossReliefAtSourceContributions: number,
	reliefAtSourceRate: number
): TaxBand[] {
	return bands.map((band) =>
		band.rate > reliefAtSourceRate
			? { ...band, startsAt: band.startsAt + grossReliefAtSourceContributions }
			: band
	);
}

export function calculateIncomeTax(taxableIncome: number, bands: TaxBand[]): IncomeTaxCalculation {
	const slices = bands.map((band, bandIndex) => {
		const endsAt = bands[bandIndex + 1]?.startsAt ?? Number.POSITIVE_INFINITY;
		const slice = sliceBetween(taxableIncome, band.startsAt, endsAt, band.rate);
		return { ...slice, name: band.name, isHigherRate: band.isHigherRate };
	});
	return { slices, total: sumOfSlices(slices) };
}

export function incomeTaxOnPayAlone(pay: number, bands: TaxBand[], rules: IncomeTaxRules): number {
	const personalAllowance = Math.min(pay, fullPersonalAllowanceFor(pay, rules));
	return calculateIncomeTax(Math.max(0, pay - personalAllowance), bands).total;
}
