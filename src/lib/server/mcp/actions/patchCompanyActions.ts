import { describePatchCompany } from './describePatchCompany';
import { describeRegisterCompanies, noSuchRegisterCompany } from './describeRegisterCompany';
import { filterRegisterCompanies, type RegisterFilters } from '$lib/server/register/filterRegisterCompanies';
import { getPatch } from '$lib/server/patches/getPatch';
import { noSuchPatch } from './describePatch';
import { readEveryStanding } from '$lib/server/clients/area/findRegisterStanding';
import { readCompanyInPatch } from '$lib/server/patches/readCompanyInPatch';
import { readRegisterForPatch } from '$lib/server/register/readRegisterForPatch';
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
				arrivedSince: textField('Keep companies first seen in the register on or after this month, as YYYY-MM-01'),
				includeHubs: textField('true to include companies at registered-office hubs'),
				includeNonTrading: textField('true to include dormant companies and those with no accounts filed')
			},
			['patchId']
		),
		run: async (caller, input) => listCompanies(caller, input)
	},
	{
		name: 'read_patch_company',
		area: 'patches',
		audience: 'staff',
		isWrite: false,
		summary: 'everything known about one company in a patch in one answer: the register row, our standing, its filed figures, where it was sighted, what was observed, and its feed',
		guidance: 'Read this before drafting an approach: it gathers what the register, the sightings, the observations and the feed hold, and names what is missing.',
		inputSchema: objectSchema({ patchId: textField('The patch id'), companyNumber: textField('The company number, as read_patch_companies gives it') }, ['patchId', 'companyNumber']),
		run: async (caller, input) => readOne(caller, input)
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
		arrivedSince: readText(input, 'arrivedSince'),
		shouldIncludeHubs: readText(input, 'includeHubs') === yes,
		shouldIncludeNonTrading: readText(input, 'includeNonTrading') === yes
	};
}

async function readOne(caller: McpCaller, input: Record<string, unknown>): Promise<string> {
	const patch = await getPatch(caller.supabase, readText(input, 'patchId'));
	if (patch === null) return noSuchPatch;
	const reading = await readCompanyInPatch(caller.supabase, patch, readText(input, 'companyNumber').toUpperCase());
	if (reading === null) return noSuchRegisterCompany;
	return describePatchCompany(reading);
}
