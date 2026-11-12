import { addProspectAsLead } from '$lib/server/clients/addProspectAsLead';
import { companiesHouseNotConfigured } from '$lib/server/register/watchRegister';
import { describeCompanySearch } from './describeCompanySearch';
import { getClient } from '$lib/server/clients/getClient';
import { importCompanyOfficers } from '$lib/server/clients/importCompanyOfficers';
import { isCompaniesHouseConfigured } from '$lib/server/companiesHouse/companiesHouseRequest';
import { isSicCode, readSicCodeList } from '$lib/data/sicCodes';
import { normaliseCompanyNumber, validateProspect } from '$lib/data/prospectRules';
import { objectSchema, readText, textField } from '../actionTypes';
import { searchCompaniesHousePage } from '$lib/server/companiesHouse/searchCompaniesHouse';
import type { McpAction } from '../actionTypes';
import type { McpCaller } from '../resolveMcpCaller';

const longestResultPage = 50;
const searchNeedsCodesOrPlace = 'Give sicCodes, a location, or both.';
const notASicCode = (code: string) => `${code} is not a SIC code: give five digits, such as 41202.`;

export const companySearchActions: McpAction[] = [
	{
		name: 'search_companies_house',
		area: 'clients',
		audience: 'staff',
		isWrite: false,
		summary: 'find active companies on Companies House by SIC code and place, as the prospect page does, to add as leads',
		inputSchema: objectSchema(
			{ sicCodes: textField('SIC codes, five digits each, separated by spaces or commas'), location: textField('A town, county or postcode area') },
			[]
		),
		run: async (_caller, input) => findCompanies(input)
	},
	{
		name: 'add_company_as_lead',
		area: 'clients',
		audience: 'staff',
		isWrite: true,
		summary: 'put a company from Companies House on the clients register as a lead, and its current officers on the People register if asked',
		guidance:
			'A company already on the register under that number, or under that name with no number yet, is given back ' +
			'rather than added twice. With withDirectors true its current officers are added as people and listed at it.',
		inputSchema: objectSchema(
			{
				name: textField('The company name, as Companies House gives it'),
				companyNumber: textField('Its company number, as search_companies_house gives it'),
				address: textField('Its registered address'),
				postcode: textField('Its postcode, when the address does not carry one'),
				withDirectors: { type: 'boolean', description: 'Also add its current officers as people' }
			},
			['name', 'companyNumber']
		),
		run: async (caller, input) => addLead(caller, input)
	}
];

async function findCompanies(input: Record<string, unknown>): Promise<string> {
	const sicCodes = readSicCodeList(readText(input, 'sicCodes'));
	const location = readText(input, 'location');
	if (sicCodes.length === 0 && location === '') return searchNeedsCodesOrPlace;
	const badCode = sicCodes.find((code) => !isSicCode(code));
	if (badCode !== undefined) return notASicCode(badCode);
	if (!isCompaniesHouseConfigured()) return companiesHouseNotConfigured;
	return describeCompanySearch(await searchCompaniesHousePage({ sicCodes, location }, longestResultPage));
}

async function addLead(caller: McpCaller, input: Record<string, unknown>): Promise<string> {
	const prospect = {
		name: readText(input, 'name'),
		companyNumber: normaliseCompanyNumber(readText(input, 'companyNumber')),
		address: readText(input, 'address'),
		postcode: readText(input, 'postcode')
	};
	const refusal = validateProspect(prospect);
	if (refusal !== null) return refusal;
	const outcome = await addProspectAsLead(caller.supabase, prospect, caller.accountId);
	const standing = outcome.wasAlreadyListed ? 'was already on the register' : 'is on the register as a lead';
	const officers = input.withDirectors === true ? await addOfficers(caller, outcome.clientId) : '';
	return `${prospect.name} ${standing} — client ${outcome.clientId}.${officers}`;
}

async function addOfficers(caller: McpCaller, clientId: string): Promise<string> {
	if (!isCompaniesHouseConfigured()) return ` ${companiesHouseNotConfigured}`;
	const client = await getClient(caller.supabase, clientId);
	if (client === null) return '';
	const outcome = await importCompanyOfficers(caller.supabase, client, caller.accountId);
	return ` ${outcome.importedCount} officer(s) added as people, ${outcome.alreadyListedCount} already listed.`;
}
