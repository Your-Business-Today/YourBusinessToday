import { isNonTradingCategory } from '$lib/data/registerRules';
import { addressKeyOf, hubAddressesIn } from './hubAddresses';
import type { LocatedRegisterCompany } from './registerCompanyRecord';

/** What a connected Claude narrows a patch's register by; every field is optional. */
export type RegisterFilters = {
	sicCode: string;
	status: string;
	incorporatedSince: string;
	arrivedSince: string;
	shouldIncludeHubs: boolean;
	shouldIncludeNonTrading: boolean;
};

export function filterRegisterCompanies(
	companies: LocatedRegisterCompany[],
	filters: RegisterFilters
): LocatedRegisterCompany[] {
	const hubs = filters.shouldIncludeHubs ? new Set<string>() : hubAddressesIn(companies);
	return companies
		.filter((company) => filters.shouldIncludeNonTrading || !isNonTradingCategory(company.accountCategory))
		.filter((company) => !hubs.has(addressKeyOf(company)))
		.filter((company) => filters.sicCode === '' || company.sicCodes.some((code) => code.startsWith(filters.sicCode)))
		.filter((company) => filters.status === '' || company.companyStatus.toLowerCase().includes(filters.status.toLowerCase()))
		.filter((company) => filters.incorporatedSince === '' || company.incorporatedOn >= filters.incorporatedSince)
		.filter((company) => filters.arrivedSince === '' || company.firstSeenMonth >= filters.arrivedSince);
}
