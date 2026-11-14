import type { SupabaseClient } from '@supabase/supabase-js';
import { watchedRowOf } from './watchedCompanyRow';
import type { CompaniesHouseCompany } from '$lib/server/companiesHouse/searchCompaniesHouse';

/** Search answers written to the register through the one door that leaves the monthly file's own columns alone. */
export async function upsertWatchedCompanies(supabase: SupabaseClient, companies: CompaniesHouseCompany[], seenMonth: string): Promise<void> {
	if (companies.length === 0) return;
	const rows = companies.map((company) => watchedRowOf(company, seenMonth));
	const { error } = await supabase.rpc('upsert_watched_companies', { rows });
	if (error) throw error;
}

/** Each company once, whichever searches found it. */
export function eachCompanyOnce(companies: CompaniesHouseCompany[]): CompaniesHouseCompany[] {
	return [...new Map(companies.map((company) => [company.companyNumber, company])).values()];
}

/** A location search matches words anywhere in an address, so only the companies whose postcode is in the outcode are kept. */
export function registeredInOutcode(companies: CompaniesHouseCompany[], outcode: string): CompaniesHouseCompany[] {
	const postcodeStart = `${outcode} `;
	return companies.filter((company) => company.postcode.toUpperCase().startsWith(postcodeStart));
}
