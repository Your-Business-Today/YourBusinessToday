import { roundToPence } from '$lib/data/books/money';
import { vehicleTypes, type VehicleType } from './takeHomeInputs';
import type { HomeWorkingBand, HomeWorkingRules, MileageRules } from './taxRuleTypes';

export type MileagePortion = {
	miles: number;
	ratePerMile: number;
	amount: number;
};

export type MileageClaim = {
	portions: MileagePortion[];
	amount: number;
};

export type HomeWorkingClaim = {
	monthlyAmount: number;
	amount: number;
};

const monthsPerYear = 12;

export function claimMileage(vehicleType: VehicleType, miles: number, rules: MileageRules): MileageClaim {
	const portions = mileagePortions(vehicleType, Math.max(0, miles), rules).filter(
		(portion) => portion.miles > 0
	);
	const amount = roundToPence(portions.reduce((total, portion) => total + portion.amount, 0));
	return { portions, amount };
}

export function claimHomeWorking(band: HomeWorkingBand, rules: HomeWorkingRules): HomeWorkingClaim {
	const monthlyAmount = rules.monthlyAmountByBand[band];
	return { monthlyAmount, amount: monthlyAmount * monthsPerYear };
}

function mileagePortions(vehicleType: VehicleType, miles: number, rules: MileageRules): MileagePortion[] {
	if (vehicleType === vehicleTypes.carOrVan) return carOrVanPortions(miles, rules);
	if (vehicleType === vehicleTypes.motorcycle) return [portionAt(miles, rules.motorcycleRate)];
	if (vehicleType === vehicleTypes.bicycle) return [portionAt(miles, rules.bicycleRate)];
	return [];
}

function carOrVanPortions(miles: number, rules: MileageRules): MileagePortion[] {
	const firstMiles = Math.min(miles, rules.carOrVanFirstMiles);
	return [
		portionAt(firstMiles, rules.carOrVanFirstMilesRate),
		portionAt(miles - firstMiles, rules.carOrVanLaterMilesRate)
	];
}

function portionAt(miles: number, ratePerMile: number): MileagePortion {
	return { miles, ratePerMile, amount: roundToPence(miles * ratePerMile) };
}
