import { addPremisesAsLead } from '$lib/server/premises/addPremisesAsLead';
import { describePremisesList } from './describePremises';
import { getPremises } from '$lib/server/premises/getPremises';
import { listPremisesMatching, type PremisesNarrowing } from '$lib/server/premises/listPremisesMatching';
import { objectSchema, readText, textField } from '../actionTypes';
import { parsePremisesSource } from '$lib/server/premises/premisesSource';
import { premisesSourceLabels } from '$lib/data/foodHygieneRules';
import { validatePremisesInPatch } from '$lib/server/premises/validatePremisesInPatch';
import { withPatch } from '$lib/server/patches/withPatch';
import type { McpAction } from '../actionTypes';
import type { McpCaller } from '../resolveMcpCaller';
import type { Patch } from '$lib/server/patches/patchRecord';

const yes = 'true';
const newForDays = 30;
const millisecondsPerDay = 86_400_000;

export const premisesActions: McpAction[] = [
	{
		name: 'list_patch_premises',
		area: 'patches',
		audience: 'staff',
		isWrite: false,
		summary: 'the businesses trading in a territory at their real addresses: food businesses from the Food Standards Agency and trading places from Overture Maps, newest first, a hundred at most',
		guidance:
			'A café, pub, shop or office listed here is already known: add it with add_premises_as_lead rather than recording it ' +
			'as a sighting. A territory can hold thousands, so narrow by sector: newOnly keeps the ones first listed in the last thirty days, ' +
			'and source and category narrow further. The last line says how many more fit.',
		inputSchema: objectSchema(
			{
				patchId: textField('The territory id, as given by list_patches'),
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
		summary: 'put a premises from the territory on the clients register as a lead, a food business or a trading place, with the page of the register that lists it as the source',
		inputSchema: objectSchema({ patchId: textField('The territory id'), premisesId: textField('The premises id, as list_patch_premises gives it') }, ['patchId', 'premisesId']),
		run: async (caller, input) => withPatch(caller, input, (patch) => addAsLead(caller, patch, readText(input, 'premisesId')))
	}
];

async function list(caller: McpCaller, patch: Patch, input: Record<string, unknown>): Promise<string> {
	const narrowing = narrowingOf(input);
	const matched = await listPremisesMatching(caller.supabase, patch.outcodes, narrowing);
	return describePremisesList(matched, isNarrowed(narrowing));
}

function narrowingOf(input: Record<string, unknown>): PremisesNarrowing {
	const source = readText(input, 'source');
	const isNewOnly = readText(input, 'newOnly') === yes;
	const newSince = new Date(Date.now() - newForDays * millisecondsPerDay);
	return {
		sector: readText(input, 'sector').toUpperCase(),
		source: source === '' ? null : parsePremisesSource(source),
		category: readText(input, 'category'),
		firstSeenSince: isNewOnly ? newSince.toISOString() : null
	};
}

function isNarrowed(narrowing: PremisesNarrowing): boolean {
	const { sector, source, category, firstSeenSince } = narrowing;
	return sector !== '' || source !== null || category !== '' || firstSeenSince !== null;
}

async function addAsLead(caller: McpCaller, patch: Patch, premisesId: string): Promise<string> {
	const premises = await getPremises(caller.supabase, premisesId);
	const refusal = validatePremisesInPatch(premises, patch);
	if (refusal !== null || premises === null) return refusal ?? '';
	const outcome = await addPremisesAsLead(caller.supabase, premises, patch.id, caller.accountId);
	if (outcome.wasAlreadyListed) return `${premises.businessName} is already on the register as client ${outcome.clientId}.`;
	return `${premises.businessName} is now a lead — client ${outcome.clientId}.`;
}
