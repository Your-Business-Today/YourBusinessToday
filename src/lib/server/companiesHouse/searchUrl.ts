import { companiesHouseApiOrigin } from './companiesHouseOrigin';

/** What the advanced search is asked: the codes and the place always, and the dates, statuses and page a watcher adds. */
export type CompaniesHouseSearch = {
	sicCodes: string[];
	location: string;
	incorporatedFrom?: string;
	incorporatedTo?: string;
	dissolvedFrom?: string;
	companyStatuses?: string[];
	startIndex?: number;
};

const advancedSearchPath = '/advanced-search/companies';
const activeCompanyStatus = 'active';

/** The one URL every search is built by: a status is active unless the search names its own. */
export function searchUrlFor(search: CompaniesHouseSearch, pageSize: number): URL {
	const url = new URL(advancedSearchPath, companiesHouseApiOrigin);
	for (const code of search.sicCodes) url.searchParams.append('sic_codes', code);
	if (search.location !== '') url.searchParams.set('location', search.location);
	for (const status of search.companyStatuses ?? [activeCompanyStatus]) url.searchParams.append('company_status', status);
	setIfNamed(url, 'incorporated_from', search.incorporatedFrom);
	setIfNamed(url, 'incorporated_to', search.incorporatedTo);
	setIfNamed(url, 'dissolved_from', search.dissolvedFrom);
	const startIndex = search.startIndex === undefined ? undefined : String(search.startIndex);
	setIfNamed(url, 'start_index', startIndex);
	url.searchParams.set('size', String(pageSize));
	return url;
}

function setIfNamed(url: URL, parameter: string, value: string | undefined): void {
	if (value === undefined) return;
	url.searchParams.set(parameter, value);
}
