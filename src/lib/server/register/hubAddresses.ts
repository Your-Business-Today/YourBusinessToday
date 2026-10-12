import { companiesAtOneAddressThatMakeAHub } from '$lib/data/registerRules';
import type { LocatedRegisterCompany } from './registerCompanyRecord';

/** The addresses so many companies are registered at that they are an agent's office, not a business. */
export function hubAddressesIn(companies: LocatedRegisterCompany[]): Set<string> {
	const hubs = new Set<string>();
	for (const [address, residents] of groupByAddress(companies)) {
		if (residents.length >= companiesAtOneAddressThatMakeAHub) hubs.add(address);
	}
	return hubs;
}

export function addressKeyOf(company: LocatedRegisterCompany): string {
	return `${company.registeredAddress.toLowerCase()}|${company.postcode}`;
}

export function groupByAddress(companies: LocatedRegisterCompany[]): Map<string, LocatedRegisterCompany[]> {
	const groups = new Map<string, LocatedRegisterCompany[]>();
	for (const company of companies) {
		const key = addressKeyOf(company);
		groups.set(key, [...(groups.get(key) ?? []), company]);
	}
	return groups;
}

