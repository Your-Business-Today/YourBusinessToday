import { restOfUkBands, scottishBandsFor2026To2027 } from './incomeTaxBands';
import { ruleSources } from './ruleSources';
import { incomeTaxRulesWith, sharedClass1, sharedClass4, sharedHomeWorkingRules } from './sharedRules';
import type { TaxYearRules } from './taxRuleTypes';

export const rulesFor2026To2027: TaxYearRules = {
	taxYear: '2026/27',
	label: '2026/27 tax year (6 April 2026 to 5 April 2027)',
	datesCovered: '6 April 2026 to 5 April 2027',
	startsOn: '2026-04-06',
	balancingPaymentDueOn: '2028-01-31',
	secondPaymentOnAccountDueOn: '2028-07-31',
	verifiedOn: '2026-09-23',
	incomeTax: incomeTaxRulesWith(restOfUkBands, scottishBandsFor2026To2027),
	nationalInsurance: {
		class1: sharedClass1,
		class4: sharedClass4,
		class2WeeklyRate: 3.65,
		smallProfitsThreshold: 7105,
		sourceUrl: ruleSources.nationalInsurance
	},
	studentLoans: {
		undergraduatePlans: {
			plan1: { threshold: 26900, rate: 0.09 },
			plan2: { threshold: 29385, rate: 0.09 },
			plan4: { threshold: 33795, rate: 0.09 },
			plan5: { threshold: 25000, rate: 0.09 }
		},
		postgraduate: { threshold: 21000, rate: 0.06 },
		sourceUrl: ruleSources.employerRates2026To2027
	},
	mileage: {
		carOrVanFirstMiles: 10000,
		carOrVanFirstMilesRate: 0.55,
		carOrVanLaterMilesRate: 0.25,
		motorcycleRate: 0.24,
		bicycleRate: 0.2,
		sourceUrl: ruleSources.approvedMileageRates
	},
	homeWorking: sharedHomeWorkingRules,
	makingTaxDigital: {
		qualifyingIncomeThreshold: 20000,
		appliesFrom: '2028-04-06',
		sourceUrl: ruleSources.makingTaxDigital
	}
};
