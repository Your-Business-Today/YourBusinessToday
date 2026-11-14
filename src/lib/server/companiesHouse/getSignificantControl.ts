import { CompaniesHouseRefusal, companiesHouseApiOrigin, requestCompaniesHouse } from './companiesHouseRequest';
import { parseSignificantControl, type SignificantControl } from './significantControlRecord';

const longestResultPage = 100;
/** A company with no significant-control list is answered "not found", which means no entry, not a fault. */
const notFound = 404;

export async function getSignificantControl(companyNumber: string): Promise<SignificantControl[]> {
	const url = new URL(`/company/${encodeURIComponent(companyNumber)}/persons-with-significant-control`, companiesHouseApiOrigin);
	url.searchParams.set('items_per_page', String(longestResultPage));
	const answer = await requestCompaniesHouse(url).catch(emptyWhenNotFound);
	return parseSignificantControl(answer);
}

function emptyWhenNotFound(error: unknown): Record<string, unknown> {
	const isNotFound = error instanceof CompaniesHouseRefusal && error.status === notFound;
	if (isNotFound) return { items: [] };
	throw error;
}
