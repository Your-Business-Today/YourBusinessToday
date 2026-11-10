import type { StudentLoanSelection } from './studentLoans';
import type { HomeWorkingBand, TaxRegion, TaxYearName } from './taxRuleTypes';

export type EarningType = 'employed' | 'selfEmployed' | 'both';
export const earningTypes = { employed: 'employed', selfEmployed: 'selfEmployed', both: 'both' } as const satisfies Record<EarningType, EarningType>;

export type TradingStatus = 'soleTrader' | 'cisSubcontractor';

export type VehicleType = 'none' | 'carOrVan' | 'motorcycle' | 'bicycle';
export const vehicleTypes = { none: 'none', carOrVan: 'carOrVan', motorcycle: 'motorcycle', bicycle: 'bicycle' } as const satisfies Record<VehicleType, VehicleType>;

export type SelfEmploymentInputs = {
	tradingStatus: TradingStatus;
	annualIncome: number;
	annualExpenses: number;
	annualCisDeductions: number;
	annualBusinessMiles: number;
	vehicleType: VehicleType;
	homeWorkingBand: HomeWorkingBand;
};

export type TakeHomeInputs = {
	taxYear: TaxYearName;
	taxRegion: TaxRegion;
	earningType: EarningType;
	annualSalary: number;
	annualBonus: number;
	selfEmployment: SelfEmploymentInputs;
	pensionPercentage: number;
	studentLoans: StudentLoanSelection;
};

export function hasEmployment(inputs: TakeHomeInputs): boolean {
	return inputs.earningType !== 'selfEmployed';
}

export function hasSelfEmployment(inputs: TakeHomeInputs): boolean {
	return inputs.earningType !== 'employed';
}
