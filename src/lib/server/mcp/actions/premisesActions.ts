import { addPremisesAsLead } from '$lib/server/premises/addPremisesAsLead';
import { describePremisesList } from './describePremises';
import { getPremises } from '$lib/server/premises/getPremises';
import { listPremisesForPatch } from '$lib/server/premises/listPremisesForPatch';
import { objectSchema, readText, textField } from '../actionTypes';
import { parsePremisesSource } from '$lib/server/premises/premisesSource';
import { premisesSourceLabels } from '$lib/data/foodHygieneRules';
import { validatePremisesInPatch } from '$lib/server/premises/validatePremisesInPatch';
import { withPatch } from '$lib/server/patches/withPatch';
import type { McpAction } from '../actionTypes';
import type { McpCaller } from '../resolveMcpCaller';
import type { Patch } from '$lib/server/patches/patchRecord';
import type { Premises } from '$lib/server/premises/premisesRecord';

const yes = 'true';
const newForDays = 30;
const millisecondsPerDay = 86_400_000;

export const premisesActions: McpAction[] = [
	{
		name: 'list_patch_premises',
		area: 'patches',
		audience: 'staff',
		isWrite: false,
		summary: 'every business trading in a patch at its real address: food businesses from the Food Standards Agency and trading places from Overture Maps, newest first',
		guidance:
			'A café, pub, shop or office listed here is already known: add it with add_premises_as_lead rather than recording it ' +
			'as a sighting. newOnly keeps the ones first listed in the last thirty days; source and category narrow further.',
		inputSchema: objectSchema(
			{
				patchId: textField('The patch id, as given by list_patches'),
				sector: textField('Narrow to one sector, such as KT1 1'),
				newOnly: textField('true to keep only premises first listed in the last thirty days'),
				source: textField(`One source: ${Object.keys(premisesSourceLabels).join(' or ')}`),
				category: textField('Keep places whose category contains this word, such as solicitor or cafe')
			},
			['patchId']
		),
		run: async (caller, input) => withPatch(caller, input, (patch) => list(caller, patch, input))
	},
	{
		name: 'add_premises_as_lead',
		area: 'patches',
		audience: 'staff',
		isWrite: true,
		summary: 'put a food premises from the patch on the clients register as a lead, with its Food Standards Agency page as the source',
		inputSchema: objectSchema({ patchId: textField('The patch id'), premisesId: textField('The premises id, as list_patch_premises gives it') }, ['patchId', 'premisesId']),
		run: async (caller, input) => withPatch(caller, input, (patch) => addAsLead(caller, patch, readText(input, 'premisesId')))
	}
];

async function list(caller: McpCaller, patch: Patch, input: Record<string, unknown>): Promise<string> {
	const sector = readText(input, 'sector').toUpperCase();
	const isNewOnly = readText(input, 'newOnly') === yes;
	const source = readText(input, 'source');
	const category = readText(input, 'category').toLowerCase();
	const newSince = Date.now() - newForDays * millisecondsPerDay;
	const premises = (await listPremisesForPatch(caller.supabase, patch.outcodes))
		.filter((one) => sector === '' || one.sector === sector)
		.filter((one) => !isNewOnly || isFirstSeenSince(one, newSince))
		.filter((one) => source === '' || one.source === parsePremisesSource(source))
		.filter((one) => category === '' || one.category.toLowerCase().includes(category))
		.sort(byNewest);
	return describePremisesList(premises);
}

function isFirstSeenSince(premises: Premises, since: number): boolean {
	return new Date(premises.firstSeenAt).getTime() >= since;
}

function byNewest(first: Premises, second: Premises): number {
	return second.firstSeenAt.localeCompare(first.firstSeenAt);
}

async function addAsLead(caller: McpCaller, patch: Patch, premisesId: string): Promise<string> {
	const premises = await getPremises(caller.supabase, premisesId);
	const refusal = validatePremisesInPatch(premises, patch);
	if (refusal !== null || premises === null) return refusal ?? '';
	const outcome = await addPremisesAsLead(caller.supabase, premises, patch.id, caller.accountId);
	if (outcome.wasAlreadyListed) return `${premises.businessName} is already on the register as client ${outcome.clientId}.`;
	return `${premises.businessName} is now a lead — client ${outcome.clientId}.`;
}
