import { companiesHouseNotConfigured } from '$lib/server/register/watchRegister';
import { connectionsFreshForDays, type ConnectionsReading } from '$lib/data/connectionRules';
import { daysAgo } from '$lib/data/days';
import { describeConnections } from '$lib/data/connectionsAnswer';
import { findCompanyConnections } from '$lib/server/connections/findCompanyConnections';
import { getConnectionsReading, saveConnectionsReading } from '$lib/server/connections/connectionsWriter';
import { isCompaniesHouseConfigured } from '$lib/server/companiesHouse/companiesHouseRequest';
import { normaliseCompanyNumber, validateCompanyNumber } from '$lib/data/prospectRules';
import { objectSchema, readText, textField } from '../actionTypes';
import { readSuppressedCompanies } from '$lib/server/register/registerWriter';
import { suppressedCompanyAnswer } from '$lib/data/suppressedCompanyAnswer';
import type { McpAction } from '../actionTypes';
import type { McpCaller } from '../resolveMcpCaller';

export const companyConnectionActions: McpAction[] = [
	{
		name: 'read_company_connections',
		area: 'patches',
		audience: 'staff',
		isWrite: true,
		summary: "who is behind any UK company: the companies that own over 25% of it, and its directors' other active companies, owned or only sat on; the reading is kept",
		guidance: `One line per connected company. A reading is kept and reused for ${connectionsFreshForDays} days. A director's shareholding shows only above 25%, so "no shareholding on record" does not mean none.`,
		inputSchema: objectSchema({ companyNumber: textField('The company number, such as 00445790 or SC123456') }, ['companyNumber']),
		run: async (caller, input) => readConnections(caller, normaliseCompanyNumber(readText(input, 'companyNumber')))
	}
];

async function readConnections(caller: McpCaller, companyNumber: string): Promise<string> {
	const notANumber = validateCompanyNumber(companyNumber);
	if (notANumber !== null) return notANumber;
	const suppressed = await readSuppressedCompanies(caller.supabase);
	if (suppressed.has(companyNumber)) return suppressedCompanyAnswer;
	const stored = await getConnectionsReading(caller.supabase, companyNumber);
	if (stored !== null && isFresh(stored)) return describeConnections(stored);
	if (!isCompaniesHouseConfigured()) return companiesHouseNotConfigured;
	const reading = await findCompanyConnections(companyNumber, suppressed);
	const refusal = await saveConnectionsReading(caller.supabase, reading);
	return refusal ?? describeConnections(reading);
}

function isFresh(reading: ConnectionsReading): boolean {
	return reading.checkedAt.slice(0, 10) >= daysAgo(connectionsFreshForDays);
}
