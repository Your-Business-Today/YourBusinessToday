import type { CorporationTaxRules, DividendRules, EmployerNationalInsuranceRules } from './companyRuleTypes';

export type TaxYearName = '2025/26' | '2026/27';

export type TaxRegion = 'restOfUk' | 'scotland';
export const taxRegions = { restOfUk: 'restOfUk', scotland: 'scotland' } as const satisfies Record<TaxRegion, TaxRegion>;

export type HomeWorkingBand = 'under25Hours' | '25To50Hours' | '51To100Hours' | '101HoursOrMore';

export type UndergraduateLoanPlan = 'plan1' | 'plan2' | 'plan4' | 'plan5';

export type SourcedRules = { sourceUrl: string };

export type TaxBand = {
	name: string;
	rate: number;
	startsAt: number;
	isHigherRate: boolean;
};

export type IncomeTaxRules = SourcedRules & {
	personalAllowance: number;
	personalAllowanceTaperThreshold: number;
	bandsByRegion: Record<TaxRegion, TaxBand[]>;
	pensionReliefAtSourceRate: number;
};

export type NationalInsuranceBands = {
	lowerLimit: number;
	upperLimit: number;
	mainRate: number;
	additionalRate: number;
};

export type NationalInsuranceRules = SourcedRules & {
	class1: NationalInsuranceBands;
	class4: NationalInsuranceBands;
	class2WeeklyRate: number;
	smallProfitsThreshold: number;
};

export type LoanRepayment = { threshold: number; rate: number };

export type StudentLoanRules = SourcedRules & {
	undergraduatePlans: Partial<Record<UndergraduateLoanPlan, LoanRepayment>>;
	postgraduate: LoanRepayment;
};

export type MileageRules = SourcedRules & {
	carOrVanFirstMiles: number;
	carOrVanFirstMilesRate: number;
	carOrVanLaterMilesRate: number;
	motorcycleRate: number;
	bicycleRate: number;
};

export type HomeWorkingRules = SourcedRules & {
	monthlyAmountByBand: Record<HomeWorkingBand, number>;
};

export type MakingTaxDigitalRules = SourcedRules & {
	qualifyingIncomeThreshold: number;
	appliesFrom: string;
};

export type FilingDeadlines = SourcedRules & {
	registerBy: string;
	paperReturnBy: string;
	onlineReturnToPayThroughTaxCodeBy: string;
};

export type QuarterlyUpdate = { periodEndsOn: string; dueOn: string };

export type QuarterlyUpdateRules = SourcedRules & { updates: QuarterlyUpdate[] };

export type TaxYearRules = {
	taxYear: TaxYearName;
	label: string;
	datesCovered: string;
	startsOn: string;
	balancingPaymentDueOn: string;
	secondPaymentOnAccountDueOn: string;
	verifiedOn: string;
	incomeTax: IncomeTaxRules;
	nationalInsurance: NationalInsuranceRules;
	studentLoans: StudentLoanRules;
	mileage: MileageRules;
	homeWorking: HomeWorkingRules;
	makingTaxDigital: MakingTaxDigitalRules;
	filingDeadlines: FilingDeadlines;
	quarterlyUpdates: QuarterlyUpdateRules;
	corporationTax: CorporationTaxRules;
	dividends: DividendRules;
	employerNationalInsurance: EmployerNationalInsuranceRules;
};
