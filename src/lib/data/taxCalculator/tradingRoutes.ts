import { roundToPence } from '$lib/data/books/money';
import { sensibleDirectorSalary } from './directorSalary';
import { limitedCompanyRouteFor, type LimitedCompanyRoute } from './limitedCompanyRoute';
import { taxOnEarnings, type TaxOnEarnings } from './taxOnEarnings';
import { rulesFor } from './taxYearRules';
import type { TaxRegion, TaxYearName, TaxYearRules } from './taxRuleTypes';

export type TradingRouteName = 'employed' | 'soleTrader' | 'limitedCompany';

export type TradingRouteInputs = {
	taxYear: TaxYearName;
	taxRegion: TaxRegion;
	income: number;
	directorSalary: number | null;
	companyRunningCosts: number;
};

export type TradingRouteComparison = {
	inputs: TradingRouteInputs;
	rules: TaxYearRules;
	suggestedDirectorSalary: number;
	employed: TaxOnEarnings;
	soleTrader: TaxOnEarnings;
	limitedCompany: LimitedCompanyRoute | null;
	bestRoute: TradingRouteName;
};

export function compareTradingRoutes(inputs: TradingRouteInputs): TradingRouteComparison {
	const rules = rulesFor(inputs.taxYear);
	const { income, taxRegion, companyRunningCosts: runningCosts } = inputs;
	const { class1, class4 } = rules.nationalInsurance;
	const suggestedDirectorSalary = sensibleDirectorSalary(roundToPence(income - runningCosts), rules);
	const directorSalary = inputs.directorSalary ?? suggestedDirectorSalary;
	const routes = {
		employed: taxOnEarnings(income, class1, rules, taxRegion),
		soleTrader: taxOnEarnings(income, class4, rules, taxRegion),
		limitedCompany: limitedCompanyRouteFor({ income, runningCosts, directorSalary }, rules, taxRegion)
	};
	return { inputs, rules, suggestedDirectorSalary, ...routes, bestRoute: bestRouteOf(routes) };
}

export type TradingRouteTakeHomes = Record<TradingRouteName, number | null>;

export function takeHomeByRoute({ employed, soleTrader, limitedCompany }: TradingRouteComparison): TradingRouteTakeHomes {
	return { employed: employed.takeHome, soleTrader: soleTrader.takeHome, limitedCompany: limitedCompany?.takeHome ?? null };
}

function bestRouteOf(routes: Record<TradingRouteName, { takeHome: number } | null>): TradingRouteName {
	const routeNames = Object.keys(routes) as TradingRouteName[];
	const takeHomeOf = (routeName: TradingRouteName) => routes[routeName]?.takeHome ?? Number.NEGATIVE_INFINITY;
	return routeNames.reduce((best, routeName) => (takeHomeOf(routeName) > takeHomeOf(best) ? routeName : best));
}
