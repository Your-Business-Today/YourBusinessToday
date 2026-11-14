import { companiesHouseNotConfigured } from '$lib/server/register/watchRegister';
import { describeAccountsReading } from '$lib/data/accountsReadingAnswer';
import { getAccountsReading, saveAccountsReading } from '$lib/server/register/accountsReadingWriter';
import { isCompaniesHouseConfigured } from '$lib/server/companiesHouse/companiesHouseRequest';
import { isSuppressedCompany } from '$lib/server/register/isSuppressedCompany';
import { normaliseCompanyNumber, validateCompanyNumber } from '$lib/data/prospectRules';
import { objectSchema, readText, textField } from '../actionTypes';
import { readLatestAccounts } from '$lib/server/companiesHouse/accounts/readLatestAccounts';
import type { McpAction } from '../actionTypes';
import type { McpCaller } from '../resolveMcpCaller';

export const suppressedCompanyAnswer = 'That company asked to be left alone, so it is not read.';

export const accountsReadingActions: McpAction[] = [
	{
		name: 'read_company_accounts',
		area: 'patches',
		audience: 'staff',
		isWrite: true,
		summary: "any UK company's cash at bank from its latest filed accounts, or why it is not stated: a micro-entity's current assets, dormant, no accounts yet, or filed only as a PDF; the reading is kept",
		guidance:
			'The figure is the balance on the day the accounts are made up to, and the answer always says that day. A reading is kept and reused until newer accounts are filed. A PDF-only answer gives the public page to read the balance sheet on.',
		inputSchema: objectSchema({ companyNumber: textField('The company number, such as 00445790 or SC123456') }, ['companyNumber']),
		run: async (caller, input) => readAccounts(caller, normaliseCompanyNumber(readText(input, 'companyNumber')))
	}
];

async function readAccounts(caller: McpCaller, companyNumber: string): Promise<string> {
	const notANumber = validateCompanyNumber(companyNumber);
	if (notANumber !== null) return notANumber;
	if (await isSuppressedCompany(caller.supabase, companyNumber)) return suppressedCompanyAnswer;
	if (!isCompaniesHouseConfigured()) return companiesHouseNotConfigured;
	const stored = await getAccountsReading(caller.supabase, companyNumber);
	const reading = await readLatestAccounts(companyNumber, stored);
	const refusal = reading === stored ? null : await saveAccountsReading(caller.supabase, reading);
	if (refusal !== null) return refusal;
	return describeAccountsReading(reading);
}
