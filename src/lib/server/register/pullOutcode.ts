import { earliestIncorporationDay, halvesOf, type IncorporationSlice } from './incorporationSlice';
import { eachCompanyOnce, registeredInOutcode } from './watchedCompanyWriter';
import { searchCompaniesHousePage, type CompaniesHouseCompany, type CompaniesHouseSearch, type CompanySearchPage } from '$lib/server/companiesHouse/searchCompaniesHouse';

/** The most companies one page of the advanced search is asked for. */
const pageSize = 1000;
/** The most companies one advanced search will page through; a span holding more is asked in halves. */
const searchReach = 5000;

/** Every active company registered in one outcode, and how many incorporation slices it took to reach them all. */
export type OutcodePull = { companies: CompaniesHouseCompany[]; sliceCount: number };

type SlicePull = { companies: CompaniesHouseCompany[]; sliceCount: number };

export async function pullOutcode(outcode: string, sicCodes: string[], today: string): Promise<OutcodePull> {
	const everyDay = { incorporatedFrom: earliestIncorporationDay, incorporatedTo: today };
	const pulled = await pullSlice(outcode, sicCodes, everyDay);
	return { companies: registeredInOutcode(eachCompanyOnce(pulled.companies), outcode), sliceCount: pulled.sliceCount };
}

async function pullSlice(outcode: string, sicCodes: string[], slice: IncorporationSlice): Promise<SlicePull> {
	const search = { sicCodes, location: outcode, ...slice };
	const firstPage = await searchCompaniesHousePage(search, pageSize);
	const isBeyondReach = firstPage.totalHits > searchReach;
	const halves = isBeyondReach ? halvesOf(slice) : null;
	if (halves !== null) return pullHalves(outcode, sicCodes, halves);
	const laterCompanies = await laterPages(search, firstPage);
	return { companies: [...firstPage.companies, ...laterCompanies], sliceCount: 1 };
}

async function pullHalves(outcode: string, sicCodes: string[], halves: [IncorporationSlice, IncorporationSlice]): Promise<SlicePull> {
	const earlier = await pullSlice(outcode, sicCodes, halves[0]);
	const later = await pullSlice(outcode, sicCodes, halves[1]);
	return { companies: [...earlier.companies, ...later.companies], sliceCount: earlier.sliceCount + later.sliceCount };
}

async function laterPages(search: CompaniesHouseSearch, firstPage: CompanySearchPage): Promise<CompaniesHouseCompany[]> {
	const companies: CompaniesHouseCompany[] = [];
	const lastIndex = Math.min(firstPage.totalHits, searchReach);
	for (let startIndex = pageSize; startIndex < lastIndex; startIndex += pageSize) {
		const { companies: found } = await searchCompaniesHousePage({ ...search, startIndex }, pageSize);
		companies.push(...found);
		if (found.length < pageSize) return companies;
	}
	return companies;
}
