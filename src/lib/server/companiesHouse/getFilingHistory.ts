import { companiesHouseApiOrigin, requestCompaniesHouse } from './companiesHouseRequest';
import { parseFilingHistory, type ClassifiedFiling } from './filingHistoryRecord';

const longestResultPage = 50;

/** The newest filings of one company, classified. */
export async function getFilingHistory(companyNumber: string): Promise<ClassifiedFiling[]> {
	const url = new URL(`/company/${encodeURIComponent(companyNumber)}/filing-history`, companiesHouseApiOrigin);
	url.searchParams.set('items_per_page', String(longestResultPage));
	return parseFilingHistory(await requestCompaniesHouse(url));
}
