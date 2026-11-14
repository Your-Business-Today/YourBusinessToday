import { companiesHouseNotConfigured } from '$lib/server/register/watchRegister';
import { describeAccountsReading } from '$lib/data/accountsReadingAnswer';
import { currentAccountsReading } from '$lib/server/companiesHouse/accounts/currentAccountsReading';
import { isCompaniesHouseConfigured } from '$lib/server/companiesHouse/companiesHouseRequest';
import { isSuppressedCompany } from '$lib/server/register/isSuppressedCompany';
import { normaliseCompanyNumber, validateCompanyNumber } from '$lib/data/prospectRules';
import { objectSchema, readText, textField } from '../actionTypes';
import { readPdfReadingSent } from '$lib/data/pdfReadingRules';
import { saveClaudeReading } from '$lib/server/companiesHouse/accounts/saveClaudeReading';
import { suppressedCompanyAnswer } from '$lib/data/suppressedCompanyAnswer';
import type { McpAction } from '../actionTypes';
import type { McpCaller } from '../resolveMcpCaller';


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
	},
	{
		name: 'save_company_accounts_reading',
		area: 'patches',
		audience: 'staff',
		isWrite: true,
		summary: "save the cash at bank you read from a company's balance sheet filed only as a PDF, with the Companies House page you read it on",
		guidance:
			'Only for accounts read_company_accounts says were filed only as a PDF. Open the page it gave, read the balance sheet, and send the figures in whole pounds. The reading is marked as read by you, and a reading from tagged figures is never replaced.',
		inputSchema: objectSchema(
			{
				companyNumber: textField('The company number'),
				madeUpTo: textField('The date the accounts are made up to, as YYYY-MM-DD'),
				cash: textField('Cash at bank and in hand in whole pounds, digits only, such as 12000'),
				currentAssets: textField('Current assets in whole pounds, digits only, when the balance sheet shows them'),
				page: textField('The Companies House document page you read it on, as read_company_accounts gave it')
			},
			['companyNumber', 'madeUpTo', 'cash', 'page']
		),
		run: async (caller, input) => saveReading(caller, normaliseCompanyNumber(readText(input, 'companyNumber')), input)
	}
];

async function saveReading(caller: McpCaller, companyNumber: string, input: Record<string, unknown>): Promise<string> {
	const refusal = await companyRefusal(caller, companyNumber);
	if (refusal !== null) return refusal;
	const sent = readPdfReadingSent(readText(input, 'madeUpTo'), readText(input, 'cash'), readText(input, 'currentAssets'), readText(input, 'page'));
	if (typeof sent === 'string') return sent;
	const saved = await saveClaudeReading(caller.supabase, companyNumber, sent, caller.accountId);
	return typeof saved === 'string' ? saved : `Saved. ${describeAccountsReading(saved)}`;
}

/** Why a company cannot be read now — not a number, asked to be left alone, or no key — or null. */
async function companyRefusal(caller: McpCaller, companyNumber: string): Promise<string | null> {
	const notANumber = validateCompanyNumber(companyNumber);
	if (notANumber !== null) return notANumber;
	if (await isSuppressedCompany(caller.supabase, companyNumber)) return suppressedCompanyAnswer;
	if (!isCompaniesHouseConfigured()) return companiesHouseNotConfigured;
	return null;
}

async function readAccounts(caller: McpCaller, companyNumber: string): Promise<string> {
	const refusal = await companyRefusal(caller, companyNumber);
	if (refusal !== null) return refusal;
	const reading = await currentAccountsReading(caller.supabase, companyNumber);
	return typeof reading === 'string' ? reading : describeAccountsReading(reading);
}
