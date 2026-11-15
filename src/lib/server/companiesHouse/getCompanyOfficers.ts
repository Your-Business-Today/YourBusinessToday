import { companiesHouseApiOrigin, requestCompaniesHouse } from './companiesHouseRequest';
import { parseCompanyOfficers, type CompanyOfficer } from './companyOfficerRecord';

const longestResultPage = 100;

export async function getCompanyOfficers(companyNumber: string): Promise<CompanyOfficer[]> {
	return parseCompanyOfficers(await requestCompaniesHouse(companyOfficersUrl(companyNumber)));
}

export function companyOfficersUrl(companyNumber: string): URL {
	const url = new URL(`/company/${encodeURIComponent(companyNumber)}/officers`, companiesHouseApiOrigin);
	url.searchParams.set('items_per_page', String(longestResultPage));
	return url;
}
