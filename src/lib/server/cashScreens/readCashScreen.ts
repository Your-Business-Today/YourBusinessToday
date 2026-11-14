import type { SupabaseClient } from '@supabase/supabase-js';
import { cashScreenOutcomes, screenVerdict, type ScreenVerdict } from '$lib/data/cashScreenOutcome';
import { companiesToScreen } from './companiesToScreen';
import { readAccountsReadings } from '$lib/server/register/accountsReadingWriter';
import { readConnectionsReadings } from '$lib/server/connections/connectionsReader';
import { readSuppressedCompanies } from '$lib/server/register/registerWriter';
import type { CashScreen } from './cashScreenRecord';
import type { ScreenedCompany } from '$lib/data/cashScreenAnswer';
import type { LocatedRegisterCompany } from '$lib/server/register/registerCompanyRecord';

const unreadVerdict: ScreenVerdict = { outcome: cashScreenOutcomes.fails, reason: 'Its accounts could not be read from Companies House.', madeUpTo: null };

/** Each company the screen has reached, with what it comes out as, worked out now from the kept readings; and how many are still to come. */
export async function readCashScreen(supabase: SupabaseClient, screen: CashScreen): Promise<{ screened: ScreenedCompany[]; waiting: number }> {
	const [companies, suppressed] = await Promise.all([companiesToScreen(supabase, screen), readSuppressedCompanies(supabase)]);
	const covered = companies.filter((company) => !suppressed.has(company.companyNumber));
	const isFinished = screen.finishedAt !== null;
	const reached = covered.filter((company) => isFinished || company.companyNumber <= screen.resumeAfter);
	const screened = await verdictsFor(supabase, reached, screen.leastCash);
	return { screened, waiting: covered.length - reached.length };
}

async function verdictsFor(supabase: SupabaseClient, companies: LocatedRegisterCompany[], leastCash: number): Promise<ScreenedCompany[]> {
	const companyNumbers = companies.map((company) => company.companyNumber);
	const [ownReadings, connectionReadings] = await Promise.all([readAccountsReadings(supabase, companyNumbers), readConnectionsReadings(supabase, companyNumbers)]);
	const connectedNumbers = [...connectionReadings.values()].flatMap((reading) => reading.connections.map((connection) => connection.connectedCompanyNumber));
	const connectedReadings = await readAccountsReadings(supabase, [...new Set(connectedNumbers)]);
	return companies.map((company) => {
		const own = ownReadings.get(company.companyNumber);
		const connections = connectionReadings.get(company.companyNumber) ?? null;
		const verdict = own === undefined ? unreadVerdict : screenVerdict({ own, connections, connectedReadings }, leastCash);
		return { companyNumber: company.companyNumber, name: company.name, ...verdict };
	});
}
