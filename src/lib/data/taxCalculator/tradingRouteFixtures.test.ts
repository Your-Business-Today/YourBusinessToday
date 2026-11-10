import { describe, expect, it } from 'vitest';
import { routeInputsFor, routeOutcomeOf, tradingRouteFixtureFiles } from './fixtures/tradingRouteFixtures';
import { corporationTaxBands } from './corporationTax';
import { compareTradingRoutes } from './tradingRoutes';
import { taxYearNames } from './taxYearRules';


describe('the hand-worked employed, sole trader and company fixtures', () => {
	it('hold a file for every tax year the engine knows', () => {
		const fixtureYears = tradingRouteFixtureFiles.map((file) => file.taxYear);
		expect(fixtureYears).toEqual(taxYearNames);
	});

	it.each(tradingRouteFixtureFiles)('work a company profit inside the marginal relief band for $taxYear', ({ cases }) => {
		const bands = cases.map(({ expected: { limitedCompany } }) => limitedCompany?.corporationTaxBand);
		expect(bands).toContain(corporationTaxBands.marginalRelief);
	});
});

describe.each(tradingRouteFixtureFiles)('the comparison of trading routes for $taxYear', (file) => {
	it.each(file.cases)('$name', (fixtureCase) => {
		const comparison = compareTradingRoutes(routeInputsFor(file, fixtureCase));
		expect(routeOutcomeOf(comparison)).toEqual(fixtureCase.expected);
	});
});
