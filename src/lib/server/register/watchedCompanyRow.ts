import { outcodeOf, sectorOf } from '$lib/data/postcode';
import type { CompaniesHouseCompany } from '$lib/server/companiesHouse/searchCompaniesHouse';

const companyPageOrigin = 'https://find-and-update.company-information.service.gov.uk/company/';

/** A search answer as the register takes it: what the answer carries, and nothing the monthly file alone knows. */
export function watchedRowOf(company: CompaniesHouseCompany, seenMonth: string): Record<string, unknown> {
	return {
		company_number: company.companyNumber,
		name: company.name,
		registered_address: company.address,
		postcode: company.postcode,
		outcode: outcodeOf(company.postcode),
		sector: sectorOf(company.postcode),
		company_status: company.companyStatus,
		incorporated_on: company.incorporatedOn === '' ? null : company.incorporatedOn,
		sic_codes: company.sicCodes,
		seen_month: seenMonth,
		source_url: `${companyPageOrigin}${company.companyNumber}`
	};
}

/** The first of the month a day falls in, as the register keeps months. */
export function monthOf(day: string): string {
	return `${day.slice(0, 7)}-01`;
}
