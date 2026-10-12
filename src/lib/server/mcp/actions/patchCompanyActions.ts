import { addProspectAsLead } from '$lib/server/clients/addProspectAsLead';
import { describeRegisterCompanies, noSuchRegisterCompany } from './describeRegisterCompany';
import { filterRegisterCompanies, type RegisterFilters } from '$lib/server/register/filterRegisterCompanies';
import { getPatch } from '$lib/server/patches/getPatch';
import { getRegisterCompany } from '$lib/server/register/getRegisterCompany';
import { noSuchPatch } from './describePatch';
import { readEveryStanding } from '$lib/server/clients/area/findRegisterStanding';
import { readRegisterForPatch } from '$lib/server/register/readRegisterForPatch';
import { validateProspect } from '$lib/data/prospectRules';
import { objectSchema, readText, textField } from '../actionTypes';
import type { McpAction } from '../actionTypes';
import type { McpCaller } from '../resolveMcpCaller';

const yes = 'true';

export const patchCompanyActions: McpAction[] = [
	{
		name: 'read_patch_companies',
		area: 'patches',
		audience: 'staff',
		isWrite: false,
		summary: 'every company registered in a patch as at the last monthly file, one line each, narrowed by SIC code, status or date',
		guidance:
			'A company is pinned at its registered office, which may be an accountant: addresses holding many ' +
			'companies are left out as hubs, and dormant companies are left out, unless you ask for them.',
		inputSchema: objectSchema(
			{
				patchId: textField('The patch id, as given by list_patches'),
				sicCode: textField('Keep companies whose SIC code starts with this, such as 41 or 41202'),
				status: textField('Keep companies whose status contains this, such as active or liquidation'),
				incorporatedSince: textField('Keep companies incorporated on or after this date, as YYYY-MM-DD'),
				includeHubs: textField('true to include companies at registered-office hubs'),
				includeNonTrading: textField('true to include dormant companies and those with no accounts filed')
			},
			['patchId']
		),
		run: async (caller, input) => listCompanies(caller, input)
	},
	{
		name: 'add_patch_company_as_lead',
		area: 'patches',
		audience: 'staff',
		isWrite: true,
		summary: 'put a company from the patch register on the clients register as a lead',
		inputSchema: objectSchema(
			{ patchId: textField('The patch id'), companyNumber: textField('The company number, as read_patch_companies gives it') },
			['patchId', 'companyNumber']
		),
		run: async (caller, input) => addAsLead(caller, input)
	}
];

async function listCompanies(caller: McpCaller, input: Record<string, unknown>): Promise<string> {
	const patch = await getPatch(caller.supabase, readText(input, 'patchId'));
	if (patch === null) return noSuchPatch;
	const [companies, standings] = await Promise.all([
		readRegisterForPatch(caller.supabase, patch.id),
		readEveryStanding(caller.supabase)
	]);
	return describeRegisterCompanies(filterRegisterCompanies(companies, filtersIn(input)), standings);
}

function filtersIn(input: Record<string, unknown>): RegisterFilters {
	return {
		sicCode: readText(input, 'sicCode'),
		status: readText(input, 'status'),
		incorporatedSince: readText(input, 'incorporatedSince'),
		shouldIncludeHubs: readText(input, 'includeHubs') === yes,
		shouldIncludeNonTrading: readText(input, 'includeNonTrading') === yes
	};
}

async function addAsLead(caller: McpCaller, input: Record<string, unknown>): Promise<string> {
	const patch = await getPatch(caller.supabase, readText(input, 'patchId'));
	if (patch === null) return noSuchPatch;
	const company = await getRegisterCompany(caller.supabase, readText(input, 'companyNumber'));
	if (company === null || !patch.outcodes.includes(company.outcode)) return noSuchRegisterCompany;
	const seed = { name: company.name, companyNumber: company.companyNumber, address: company.registeredAddress, postcode: company.postcode };
	const refusal = validateProspect(seed);
	if (refusal !== null) return refusal;
	const outcome = await addProspectAsLead(caller.supabase, seed, caller.accountId);
	if (outcome.wasAlreadyListed) return `${company.name} is already on the register — client id ${outcome.clientId}.`;
	return `${company.name} is on the register as a lead — client id ${outcome.clientId}.`;
}
