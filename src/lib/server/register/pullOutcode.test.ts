import { afterEach, describe, expect, it, vi } from 'vitest';
import { pullOutcode } from './pullOutcode';
import { companiesHouseAnswering, searchedCompany } from '$lib/server/companiesHouse/companiesHouseAnswers.fixture';
import { halvesOf } from './incorporationSlice';

vi.mock('$env/dynamic/private', () => ({ env: { COMPANIES_HOUSE_API_KEY: 'test-key' } }));

const today = '2026-11-14';
const searchReach = 5000;
const pageSize = 1000;

type Registered = { companyNumber: string; postcode: string; incorporatedOn: string };

/** A stand-in for the advanced search over the companies given: it filters by the dates asked, pages, and counts every hit. */
function advancedSearchOver(companies: Registered[], askedSpans: string[]) {
	return companiesHouseAnswering((address) => {
		const from = address.searchParams.get('incorporated_from') ?? '';
		const to = address.searchParams.get('incorporated_to') ?? '';
		const startIndex = Number(address.searchParams.get('start_index') ?? 0);
		askedSpans.push(`${from}..${to}@${startIndex}`);
		const matching = companies.filter((company) => company.incorporatedOn >= from && company.incorporatedOn <= to);
		const page = matching.slice(startIndex, startIndex + pageSize);
		const items = page.map((company) => searchedCompany(company.companyNumber, company.postcode, company.incorporatedOn));
		return Response.json({ items, hits: matching.length });
	});
}

function companiesIn(count: number, postcode: string, incorporatedOn: (index: number) => string): Registered[] {
	return Array.from({ length: count }, (_, index) => ({ companyNumber: `${postcode}-${index}`, postcode, incorporatedOn: incorporatedOn(index) }));
}

afterEach(() => vi.unstubAllGlobals());

describe('pulling every company in an outcode', () => {
	it('pages through an outcode that one search can reach, in one search', async () => {
		const askedSpans: string[] = [];
		vi.stubGlobal('fetch', advancedSearchOver(companiesIn(2500, 'SM1 1AA', () => '2015-06-01'), askedSpans));
		const pulled = await pullOutcode('SM1', [], today);
		expect(pulled.companies).toHaveLength(2500);
		expect(pulled.sliceCount).toBe(1);
		expect(askedSpans).toHaveLength(3);
	});

	it('asks an outcode holding more than one search reaches in slices by incorporation date, so none is cut short', async () => {
		const askedSpans: string[] = [];
		const byYear = (index: number) => `${1990 + (index % 30)}-03-01`;
		vi.stubGlobal('fetch', advancedSearchOver(companiesIn(searchReach * 2 + 1, 'SM1 1AA', byYear), askedSpans));
		const pulled = await pullOutcode('SM1', [], today);
		expect(pulled.companies).toHaveLength(searchReach * 2 + 1);
		expect(pulled.sliceCount).toBeGreaterThan(1);
	});

	it('keeps only the companies whose postcode is in the outcode, each once', async () => {
		const elsewhere = companiesIn(3, 'SM10 1AA', () => '2020-01-01');
		vi.stubGlobal('fetch', advancedSearchOver([...companiesIn(4, 'SM1 2BB', () => '2020-01-01'), ...elsewhere], []));
		const pulled = await pullOutcode('SM1', [], today);
		expect(pulled.companies.map((company) => company.postcode)).toEqual(['SM1 2BB', 'SM1 2BB', 'SM1 2BB', 'SM1 2BB']);
	});
});

describe('halving an incorporation slice', () => {
	it('splits a span into two that meet without a gap or an overlap', () => {
		expect(halvesOf({ incorporatedFrom: '2020-01-01', incorporatedTo: '2020-01-04' })).toEqual([
			{ incorporatedFrom: '2020-01-01', incorporatedTo: '2020-01-02' },
			{ incorporatedFrom: '2020-01-03', incorporatedTo: '2020-01-04' }
		]);
	});

	it('cannot split a single day', () => {
		expect(halvesOf({ incorporatedFrom: '2020-01-01', incorporatedTo: '2020-01-01' })).toBeNull();
	});
});
