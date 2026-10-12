import { accountNameLookup } from '$lib/data/accountNames';
import { createPatch, patchOutcomes, refusalFor } from '$lib/server/patches/createPatch';
import { describePatchInFull, describePatchList, noSuchPatch } from './describePatch';
import { getAccountsById } from '$lib/server/accounts/getAccountsById';
import { getPatch } from '$lib/server/patches/getPatch';
import { listPatchesWithCentres } from '$lib/server/patches/listPatchesWithCentres';
import { radiusOrder } from '$lib/data/mapRadii';
import { readPatchSeed, validatePatch } from '$lib/data/patchRules';
import { objectSchema, readText, textField } from '../actionTypes';
import type { McpAction } from '../actionTypes';
import type { McpCaller } from '../resolveMcpCaller';

const radiusField = textField(`How far the patch reaches from its centre, in miles: ${radiusOrder.join(', ')}`);

export const patchActions: McpAction[] = [
	{
		name: 'list_patches',
		area: 'patches',
		audience: 'staff',
		isWrite: false,
		summary: 'every patch being worked: its centre, radius, outcodes and who works it',
		inputSchema: objectSchema({}),
		run: async (caller) => describePatchList(await listPatchesWithCentres(caller.supabase))
	},
	{
		name: 'create_patch',
		area: 'patches',
		audience: 'staff',
		isWrite: true,
		summary: 'save an area you work as a named patch: a centre postcode, a radius and optional SIC codes',
		guidance:
			'A patch is the ground one person works, so name it for the place (Kingston, Manchester). ' +
			'Its outcodes are laid out from the radius when it is saved; narrow it with SIC codes only ' +
			'when the patch is about one trade.',
		inputSchema: objectSchema(
			{
				name: textField('What the patch is called, such as Kingston'),
				centrePostcode: textField('The full postcode at its centre, such as KT1 1EU'),
				radiusMiles: radiusField,
				sicCodes: textField('SIC codes to narrow it to, separated by commas — leave out for every trade')
			},
			['name', 'centrePostcode', 'radiusMiles']
		),
		run: async (caller, input) => savePatch(caller, input)
	},
	{
		name: 'read_patch',
		area: 'patches',
		audience: 'staff',
		isWrite: false,
		summary: 'one patch in full: its centre, radius, outcodes, SIC codes and who works it',
		inputSchema: objectSchema({ patchId: textField('The patch id, as given by list_patches') }, ['patchId']),
		run: async (caller, input) => describeOnePatch(caller, input)
	}
];

async function savePatch(caller: McpCaller, input: Record<string, unknown>): Promise<string> {
	const seed = readPatchSeed({
		name: readText(input, 'name'),
		centrePostcode: readText(input, 'centrePostcode'),
		radiusMiles: readText(input, 'radiusMiles'),
		sicCodes: readText(input, 'sicCodes')
	});
	const refusal = validatePatch(seed);
	if (refusal !== null) return refusal;
	const outcome = await createPatch(caller.supabase, seed, caller.accountId).catch(() => null);
	if (outcome === null) return 'The postcode service could not be reached just now — try again in a moment.';
	if (outcome.kind !== patchOutcomes.created) return refusalFor(outcome, seed) ?? noSuchPatch;
	const patch = await getPatch(caller.supabase, outcome.patchId);
	if (patch === null) return noSuchPatch;
	return `${patch.name} is saved as a patch over ${patch.outcodes.join(', ')} — id ${patch.id}.`;
}

async function describeOnePatch(caller: McpCaller, input: Record<string, unknown>): Promise<string> {
	const patch = await getPatch(caller.supabase, readText(input, 'patchId'));
	if (patch === null) return noSuchPatch;
	const owners = await getAccountsById(caller.supabase, patch.ownerAccountId === null ? [] : [patch.ownerAccountId]);
	const ownerName = patch.ownerAccountId === null ? 'nobody' : accountNameLookup(owners)(patch.ownerAccountId);
	return describePatchInFull(patch, ownerName);
}
