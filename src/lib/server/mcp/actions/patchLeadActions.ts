import { addPatchCompanyAsLead } from '$lib/server/patches/addPatchCompanyAsLead';
import { getPatch } from '$lib/server/patches/getPatch';
import { getRegisterCompany } from '$lib/server/register/getRegisterCompany';
import { noSuchPatch } from './describePatch';
import { noSuchRegisterCompany } from './describeRegisterCompany';
import { validateProspect } from '$lib/data/prospectRules';
import { objectSchema, readText, textField } from '../actionTypes';
import type { McpAction } from '../actionTypes';
import type { McpCaller } from '../resolveMcpCaller';

export const patchLeadActions: McpAction[] = [
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

async function addAsLead(caller: McpCaller, input: Record<string, unknown>): Promise<string> {
	const patch = await getPatch(caller.supabase, readText(input, 'patchId'));
	if (patch === null) return noSuchPatch;
	const company = await getRegisterCompany(caller.supabase, readText(input, 'companyNumber'));
	if (company === null || !patch.outcodes.includes(company.outcode)) return noSuchRegisterCompany;
	const seed = { name: company.name, companyNumber: company.companyNumber, address: company.registeredAddress, postcode: company.postcode };
	const refusal = validateProspect(seed);
	if (refusal !== null) return refusal;
	const outcome = await addPatchCompanyAsLead(caller.supabase, patch, seed, caller.accountId);
	if (outcome.wasAlreadyListed) return `${company.name} is already on the register — client id ${outcome.clientId}.`;
	return `${company.name} is on the register as a lead — client id ${outcome.clientId}.`;
}
