import { afterEach, describe, expect, it, vi } from 'vitest';
import { searchCompaniesHouse, searchCompaniesHousePage } from './searchCompaniesHouse';
import { getCompanyProfile } from './getCompanyProfile';
import { companiesHouseAnswering, refusalAnswer, searchAnswer, searchedCompany } from './companiesHouseAnswers.fixture';

vi.mock('$env/dynamic/private', () => ({ env: { COMPANIES_HOUSE_API_KEY: 'test-key' } }));

const noCompaniesFound = 404;
const faultStatuses = [400, 401, 429, 500];
const search = { sicCodes: ['01250'], location: 'Nowhere' };

function answerEveryCallWith(answer: () => Response): void {
	vi.stubGlobal('fetch', companiesHouseAnswering(answer));
}

afterEach(() => vi.unstubAllGlobals());

describe('a Companies House search', () => {
	it('reads "No companies found" as an empty page', async () => {
		answerEveryCallWith(() => refusalAnswer(noCompaniesFound));
		expect(await searchCompaniesHousePage(search, 50)).toEqual({ companies: [], totalHits: 0 });
		expect(await searchCompaniesHouse(search)).toEqual([]);
	});

	it('lists the companies of a search that matches some', async () => {
		answerEveryCallWith(() => searchAnswer([searchedCompany('00000001', 'KT1 1AA', '2026-11-12')]));
		const page = await searchCompaniesHousePage(search, 50);
		expect(page.totalHits).toBe(1);
		expect(page.companies[0].companyNumber).toBe('00000001');
	});

	it.each(faultStatuses)('still fails on status %i, in the same words', async (status) => {
		answerEveryCallWith(() => refusalAnswer(status));
		await expect(searchCompaniesHousePage(search, 50)).rejects.toThrow(`Companies House answered with status ${status}`);
	});

	it('still fails when a company asked for by number is not on the register', async () => {
		answerEveryCallWith(() => refusalAnswer(noCompaniesFound));
		await expect(getCompanyProfile('00000001')).rejects.toThrow('Companies House answered with status 404');
	});
});
