import type { CorporationTaxBand } from '../corporationTax';
import type { LimitedCompanyRoute } from '../limitedCompanyRoute';
import type { TaxOnEarnings } from '../taxOnEarnings';
import type { TradingRouteComparison, TradingRouteInputs, TradingRouteName } from '../tradingRoutes';
import type { TaxYearName } from '../taxRuleTypes';
import tradingRoutes2025To2026 from './tradingRoutes2025To2026.json';
import tradingRoutes2026To2027 from './tradingRoutes2026To2027.json';

type FixtureInputs = Omit<TradingRouteInputs, 'taxYear'>;

type EarningsOutcome = Omit<TaxOnEarnings, 'earnings'>;

type CompanyOutcome = {
	directorSalary: number;
	employerNationalInsurance: number;
	profit: number;
	corporationTaxBand: CorporationTaxBand;
	marginalRelief: number;
	corporationTax: number;
	dividends: number;
	personalAllowance: number;
	salaryIncomeTax: number;
	employeeNationalInsurance: number;
	dividendTax: number;
	takeHome: number;
};

export type TradingRouteOutcome = {
	employed: EarningsOutcome;
	soleTrader: EarningsOutcome;
	limitedCompany: CompanyOutcome | null;
	bestRoute: TradingRouteName;
};

export type TradingRouteFixtureCase = {
	name: string;
	inputs: Partial<FixtureInputs> & { income: number };
	working: string[];
	expected: TradingRouteOutcome;
};

export type TradingRouteFixtureFile = { taxYear: TaxYearName; defaultInputs: Omit<FixtureInputs, 'income'>; cases: TradingRouteFixtureCase[] };

export const tradingRouteFixtureFiles = [tradingRoutes2025To2026, tradingRoutes2026To2027] as TradingRouteFixtureFile[];

export function routeInputsFor(file: TradingRouteFixtureFile, fixtureCase: TradingRouteFixtureCase): TradingRouteInputs {
	return { ...file.defaultInputs, ...fixtureCase.inputs, taxYear: file.taxYear };
}

export function routeOutcomeOf(comparison: TradingRouteComparison): TradingRouteOutcome {
	const { employed, soleTrader, limitedCompany, bestRoute } = comparison;
	return {
		employed: earningsOutcomeOf(employed),
		soleTrader: earningsOutcomeOf(soleTrader),
		limitedCompany: limitedCompany && companyOutcomeOf(limitedCompany),
		bestRoute
	};
}

function earningsOutcomeOf({ personalAllowance, incomeTax, nationalInsurance, takeHome }: TaxOnEarnings): EarningsOutcome {
	return { personalAllowance, incomeTax, nationalInsurance, takeHome };
}

function companyOutcomeOf(route: LimitedCompanyRoute): CompanyOutcome {
	const { corporationTax, director } = route;
	const { dividendTax } = director;
	return {
		directorSalary: route.directorSalary,
		employerNationalInsurance: route.employerNationalInsurance,
		profit: route.profit,
		corporationTaxBand: corporationTax.band,
		marginalRelief: corporationTax.marginalRelief,
		corporationTax: corporationTax.total,
		dividends: route.dividends,
		personalAllowance: director.personalAllowance,
		salaryIncomeTax: director.salaryIncomeTax,
		employeeNationalInsurance: director.employeeNationalInsurance,
		dividendTax: dividendTax.total,
		takeHome: route.takeHome
	};
}
