import type { SupabaseClient } from '@supabase/supabase-js';
import { filterRegisterCompanies } from '$lib/server/register/filterRegisterCompanies';
import { readRegisterForPatch } from '$lib/server/register/readRegisterForPatch';
import type { CashScreen } from './cashScreenRecord';
import type { LocatedRegisterCompany } from '$lib/server/register/registerCompanyRecord';

/** The territory's companies a screen covers, hubs and dormant companies left out, in company-number order so it can resume. */
export async function companiesToScreen(supabase: SupabaseClient, screen: CashScreen): Promise<LocatedRegisterCompany[]> {
	const companies = await readRegisterForPatch(supabase, screen.patchId);
	const filters = { sicCode: screen.sicCode, status: '', incorporatedSince: '', arrivedSince: '', shouldIncludeHubs: false, shouldIncludeNonTrading: false };
	const isInSector = (company: LocatedRegisterCompany) => screen.sector === '' || company.sector === screen.sector;
	return filterRegisterCompanies(companies, filters)
		.filter(isInSector)
		.sort((first, second) => first.companyNumber.localeCompare(second.companyNumber));
}
