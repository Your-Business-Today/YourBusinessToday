import { describe, expect, it } from 'vitest';
import { inputsFor, outcomeOf, takeHomeFixtureFiles } from './fixtures/takeHomeFixtures';
import { estimateTakeHome } from './takeHomeEstimate';
import { taxYearNames } from './taxYearRules';

const fewestCasesPerTaxYear = 40;

describe('the hand-worked take-home fixtures', () => {
	it('hold a file for every tax year the engine knows', () => {
		const fixtureYears = takeHomeFixtureFiles.map((file) => file.taxYear);
		expect(fixtureYears).toEqual(taxYearNames);
	});

	it.each(takeHomeFixtureFiles)('hold at least 40 cases for $taxYear, each with its working', ({ cases }) => {
		expect(cases.length).toBeGreaterThanOrEqual(fewestCasesPerTaxYear);
		cases.forEach(({ working }) => expect(working).not.toHaveLength(0));
	});
});

describe.each(takeHomeFixtureFiles)('the take-home estimate for $taxYear', (file) => {
	it.each(file.cases)('$name', (fixtureCase) => {
		const estimate = estimateTakeHome(inputsFor(file, fixtureCase));
		expect(outcomeOf(estimate)).toEqual(fixtureCase.expected);
	});
});
