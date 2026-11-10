import { restOfUkBands, scottishBandsFor2025To2026 } from './incomeTaxBands';
import { ruleSources } from './ruleSources';
import { incomeTaxRulesWith, sharedClass1, sharedClass4, sharedHomeWorkingRules } from './sharedRules';
import type { TaxYearRules } from './taxRuleTypes';

export const rulesFor2025To2026: TaxYearRules = {
	taxYear: '2025/26',
	label: '2025/26 tax year (6 April 2025 to 5 April 2026)',
	datesCovered: '6 April 2025 to 5 April 2026',
	startsOn: '2025-04-06',
	balancingPaymentDueOn: '2027-01-31',
	secondPaymentOnAccountDueOn: '2027-07-31',
	verifiedOn: '2026-09-23',
	incomeTax: incomeTaxRulesWith(restOfUkBands, scottishBandsFor2025To2026),
	nationalInsurance: {
		class1: sharedClass1,
		class4: sharedClass4,
		class2WeeklyRate: 3.5,
		smallProfitsThreshold: 6845,
		sourceUrl: ruleSources.nationalInsurance
	},
	studentLoans: {
		undergraduatePlans: {
			plan1: { threshold: 26065, rate: 0.09 },
			plan2: { threshold: 28470, rate: 0.09 },
			plan4: { threshold: 32745, rate: 0.09 }
		},
		postgraduate: { threshold: 21000, rate: 0.06 },
		sourceUrl: ruleSources.employerRates2025To2026
	},
	mileage: {
		carOrVanFirstMiles: 10000,
		carOrVanFirstMilesRate: 0.45,
		carOrVanLaterMilesRate: 0.25,
		motorcycleRate: 0.24,
		bicycleRate: 0.2,
		sourceUrl: ruleSources.approvedMileageRates
	},
	homeWorking: sharedHomeWorkingRules,
	makingTaxDigital: {
		qualifyingIncomeThreshold: 30000,
		appliesFrom: '2027-04-06',
		sourceUrl: ruleSources.makingTaxDigital
	}
};
