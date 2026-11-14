import { afterEach, describe, expect, it, vi } from 'vitest';
import { findCompaniesAround } from './findCompaniesAround';
import { companiesHouseAnswering, refusalAnswer, searchAnswer, searchedCompany } from '$lib/server/companiesHouse/companiesHouseAnswers.fixture';

vi.mock('$env/dynamic/private', () => ({ env: { COMPANIES_HOUSE_API_KEY: 'test-key' } }));

const noCompaniesFound = 404;
const emptyOutcode = 'SW1B';

afterEach(() => vi.unstubAllGlobals());

describe('finding the companies around a place', () => {
	it('keeps the companies of the outcodes that have some when one has none', async () => {
		vi.stubGlobal('fetch', companiesHouseAnswering((address) => {
			const outcode = address.searchParams.get('location') ?? '';
			if (outcode === emptyOutcode) return refusalAnswer(noCompaniesFound);
			return searchAnswer([searchedCompany(`${outcode}-1`, `${outcode} 1AA`, '2020-01-01')]);
		}));
		const around = await findCompaniesAround(['SW1A', emptyOutcode, 'SW1C'], ['01250']);
		expect(around.companies.map((company) => company.companyNumber)).toEqual(['SW1A-1', 'SW1C-1']);
		expect(around.totalHits).toBe(2);
	});
});
