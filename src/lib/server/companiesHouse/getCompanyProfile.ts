import { companiesHouseApiOrigin, requestCompaniesHouse } from './companiesHouseRequest';
import { parseCompanyProfile, type CompanyProfile } from './companyProfileRecord';

export async function getCompanyProfile(companyNumber: string): Promise<CompanyProfile> {
	const url = new URL(`/company/${encodeURIComponent(companyNumber)}`, companiesHouseApiOrigin);
	return parseCompanyProfile(await requestCompaniesHouse(url));
}
