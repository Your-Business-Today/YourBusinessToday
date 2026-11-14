import { CompaniesHouseRefusal, requestCompaniesHouse } from './companiesHouseRequest';
import { searchUrlFor, type CompaniesHouseSearch } from './searchUrl';
export type { CompaniesHouseSearch } from './searchUrl';
import { describeRegisteredAddress, postcodeOfRegisteredAddress } from './registeredAddress';

export type CompaniesHouseCompany = {
	companyNumber: string;
	name: string;
	incorporatedOn: string;
	dissolvedOn: string;
	companyStatus: string;
	address: string;
	postcode: string;
	sicCodes: string[];
};

export type CompanySearchPage = { companies: CompaniesHouseCompany[]; totalHits: number };

const longestResultPage = 50;
/** The advanced search's own answer for a search that matches no company: "No companies found". */
const noCompaniesFound = 404;
const emptySearchAnswer: Record<string, unknown> = { items: [], hits: 0 };

export function readCompaniesHouseSearch(searchParams: URLSearchParams): CompaniesHouseSearch | null {
	const sicCodes = (searchParams.get('sicCodes') ?? '')
		.split(/[,\s]+/)
		.map((code) => code.trim())
		.filter((code) => code !== '');
	const location = (searchParams.get('location') ?? '').trim();
	if (sicCodes.length === 0 && location === '') return null;
	return { sicCodes, location };
}

export async function searchCompaniesHouse(
	search: CompaniesHouseSearch,
	pageSize = longestResultPage
): Promise<CompaniesHouseCompany[]> {
	const page = await searchCompaniesHousePage(search, pageSize);
	return page.companies;
}

export async function searchCompaniesHousePage(
	search: CompaniesHouseSearch,
	pageSize: number
): Promise<CompanySearchPage> {
	const answer = await requestCompaniesHouse(searchUrlFor(search, pageSize)).catch(emptyWhenNoCompanyFound);
	return parseCompanySearchPage(answer);
}

function emptyWhenNoCompanyFound(error: unknown): Record<string, unknown> {
	const isNoCompanyFound = error instanceof CompaniesHouseRefusal && error.status === noCompaniesFound;
	if (isNoCompanyFound) return emptySearchAnswer;
	throw error;
}

export function parseCompanySearchPage(body: Record<string, unknown>): CompanySearchPage {
	const items = Array.isArray(body.items) ? (body.items as Record<string, unknown>[]) : [];
	return { companies: items.map(parseCompany), totalHits: Number(body.hits ?? items.length) };
}

function parseCompany(item: Record<string, unknown>): CompaniesHouseCompany {
	return {
		companyNumber: String(item.company_number ?? ''),
		name: String(item.company_name ?? ''),
		incorporatedOn: String(item.date_of_incorporation ?? ''),
		dissolvedOn: String(item.date_of_cessation ?? ''),
		companyStatus: String(item.company_status ?? ''),
		address: describeRegisteredAddress(item.registered_office_address),
		postcode: postcodeOfRegisteredAddress(item.registered_office_address),
		sicCodes: Array.isArray(item.sic_codes) ? item.sic_codes.map(String) : []
	};
}
