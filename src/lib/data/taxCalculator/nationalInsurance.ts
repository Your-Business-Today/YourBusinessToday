import { sliceBetween, sumOfSlices, type BandSlice } from './bandSlice';
import type { NationalInsuranceBands } from './taxRuleTypes';

export type NationalInsuranceCalculation = {
	mainRate: BandSlice;
	additionalRate: BandSlice;
	total: number;
};

export function calculateNationalInsurance(
	earnings: number,
	bands: NationalInsuranceBands
): NationalInsuranceCalculation {
	const mainRate = sliceBetween(earnings, bands.lowerLimit, bands.upperLimit, bands.mainRate);
	const additionalRate = sliceBetween(earnings, bands.upperLimit, Number.POSITIVE_INFINITY, bands.additionalRate);
	return { mainRate, additionalRate, total: sumOfSlices([mainRate, additionalRate]) };
}
