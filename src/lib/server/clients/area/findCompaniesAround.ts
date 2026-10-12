import { inBatches } from '$lib/data/inBatches';
import {
	searchCompaniesHousePage,
	type CompaniesHouseCompany
} from '$lib/server/companiesHouse/searchCompaniesHouse';

export type CompaniesAround = { companies: CompaniesHouseCompany[]; totalHits: number };

const longestOutcodePage = 200;
const outcodesSearchedAtOnce = 4;

export async function findCompaniesAround(outcodes: string[], sicCodes: string[]): Promise<CompaniesAround> {
	const byNumber = new Map<string, CompaniesHouseCompany>();
	let totalHits = 0;
	for (const batch of inBatches(outcodes, outcodesSearchedAtOnce)) {
		const pages = await Promise.all(
			batch.map((outcode) => searchCompaniesHousePage({ sicCodes, location: outcode }, longestOutcodePage))
		);
		for (const page of pages) {
			totalHits += page.totalHits;
			for (const company of page.companies) byNumber.set(company.companyNumber, company);
		}
	}
	return { companies: [...byNumber.values()], totalHits };
}
