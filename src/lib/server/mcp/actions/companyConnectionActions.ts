import { companiesHouseNotConfigured } from '$lib/server/register/watchRegister';
import { connectionsFreshForDays } from '$lib/data/connectionRules';
import { describeConnections } from '$lib/data/connectionsAnswer';
import { currentConnections } from '$lib/server/connections/currentConnections';
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
	if (!isCompaniesHouseConfigured()) return companiesHouseNotConfigured;
	const reading = await currentConnections(caller.supabase, companyNumber, suppressed);
	return typeof reading === 'string' ? reading : describeConnections(reading);
}
