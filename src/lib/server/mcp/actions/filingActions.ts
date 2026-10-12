import { companiesHouseNotConfigured } from '$lib/server/register/watchRegister';
import { describeFilings } from './describeFilings';
import { getCompanyProfile } from '$lib/server/companiesHouse/getCompanyProfile';
import { getFilingHistory } from '$lib/server/companiesHouse/getFilingHistory';
import { isCompaniesHouseConfigured } from '$lib/server/companiesHouse/companiesHouseRequest';
import { normaliseCompanyNumber, validateCompanyNumber } from '$lib/data/prospectRules';
import { getRegisterCompany } from '$lib/server/register/getRegisterCompany';
import { listFilingsForCompany } from '$lib/server/register/listFilingsForCompany';
import { formatBritishDateTime } from '$lib/data/britishDate';
import { objectSchema, readText, textField } from '../actionTypes';
import type { McpAction } from '../actionTypes';
import type { McpCaller } from '../resolveMcpCaller';
import type { RegisterCompany } from '$lib/server/register/registerCompanyRecord';

const readLive = 'live from Companies House';

export const filingActions: McpAction[] = [
	{
		name: 'read_company_filings',
		area: 'patches',
		audience: 'staff',
		isWrite: false,
		summary: "a company's filing history named filing by filing, with the indicator line from its profile: stored when the weekly sweep has read it, live from Companies House otherwise",
		guidance: 'Each line says what the filing is: accounts and their type, a confirmation statement, a director appointed or gone, an office move, a charge, a strike-off signal, an insolvency form.',
		inputSchema: objectSchema({ companyNumber: textField('The company number') }, ['companyNumber']),
		run: async (caller, input) => readFilings(caller, normaliseCompanyNumber(readText(input, 'companyNumber')))
	}
];

async function readFilings(caller: McpCaller, companyNumber: string): Promise<string> {
	const notANumber = validateCompanyNumber(companyNumber);
	if (notANumber !== null) return notANumber;
	const stored = await getRegisterCompany(caller.supabase, companyNumber);
	const isSwept = stored !== null && stored.indicators !== null && stored.filingsCheckedAt !== null;
	if (isSwept) return readStored(caller, stored);
	if (!isCompaniesHouseConfigured()) return companiesHouseNotConfigured;
	const [profile, filings] = await Promise.all([getCompanyProfile(companyNumber), getFilingHistory(companyNumber)]);
	return describeFilings(profile, filings, readLive);
}

async function readStored(caller: McpCaller, company: RegisterCompany): Promise<string> {
	const filings = await listFilingsForCompany(caller.supabase, company.companyNumber);
	const profile = { companyNumber: company.companyNumber, name: company.name, status: company.companyStatus, indicators: company.indicators ?? defaultIndicators };
	return describeFilings(profile, filings, `as stored by the sweep of ${formatBritishDateTime(company.filingsCheckedAt ?? '')}`);
}

const defaultIndicators = { statusDetail: '', lastAccountsType: '', isAccountsOverdue: false, isConfirmationOverdue: false, hasInsolvency: false, hasCharges: false };
