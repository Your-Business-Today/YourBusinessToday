import { companiesHouseNotConfigured } from '$lib/server/register/watchRegister';
import { describeFilings } from './describeFilings';
import { getCompanyProfile } from '$lib/server/companiesHouse/getCompanyProfile';
import { getFilingHistory } from '$lib/server/companiesHouse/getFilingHistory';
import { isCompaniesHouseConfigured } from '$lib/server/companiesHouse/companiesHouseRequest';
import { normaliseCompanyNumber, validateCompanyNumber } from '$lib/data/prospectRules';
import { objectSchema, readText, textField } from '../actionTypes';
import type { McpAction } from '../actionTypes';

const readLive = 'live from Companies House';

export const filingActions: McpAction[] = [
	{
		name: 'read_company_filings',
		area: 'patches',
		audience: 'staff',
		isWrite: false,
		summary: "a company's filing history named filing by filing, with the indicator line from its profile, read live from Companies House",
		guidance: 'Each line says what the filing is: accounts and their type, a confirmation statement, a director appointed or gone, an office move, a charge, a strike-off signal, an insolvency form.',
		inputSchema: objectSchema({ companyNumber: textField('The company number') }, ['companyNumber']),
		run: async (_caller, input) => readFilings(normaliseCompanyNumber(readText(input, 'companyNumber')))
	}
];

async function readFilings(companyNumber: string): Promise<string> {
	const notANumber = validateCompanyNumber(companyNumber);
	if (notANumber !== null) return notANumber;
	if (!isCompaniesHouseConfigured()) return companiesHouseNotConfigured;
	const [profile, filings] = await Promise.all([getCompanyProfile(companyNumber), getFilingHistory(companyNumber)]);
	return describeFilings(profile, filings, readLive);
}
