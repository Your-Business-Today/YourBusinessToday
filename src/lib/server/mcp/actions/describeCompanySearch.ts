import { formatBritishDate } from '$lib/data/britishDate';
import type { CompaniesHouseCompany, CompanySearchPage } from '$lib/server/companiesHouse/searchCompaniesHouse';

export const noCompanyMatched = 'No active company on Companies House matched that search.';

/** A page of Companies House results as the prospect table shows them, with the number to add each by. */
export function describeCompanySearch(page: CompanySearchPage): string {
	const { companies, totalHits } = page;
	if (companies.length === 0) return noCompanyMatched;
	const heading = `${totalHits} match(es); the first ${companies.length}:`;
	return [heading, ...companies.map(describeCompanyLine)].join('\n');
}

function describeCompanyLine(company: CompaniesHouseCompany): string {
	const { name, companyNumber, companyStatus, incorporatedOn, address, sicCodes } = company;
	const incorporated = incorporatedOn === '' ? null : `incorporated ${formatBritishDate(incorporatedOn)}`;
	const codes = sicCodes.length === 0 ? null : `SIC ${sicCodes.join(', ')}`;
	return [name, `company number ${companyNumber}`, companyStatus || null, incorporated, address || null, codes]
		.filter((part) => part !== null)
		.join(' — ');
}
