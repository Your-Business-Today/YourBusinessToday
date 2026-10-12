import { describeBrief } from './describeBrief';
import { observationKindOrder } from '$lib/data/observationRules';
import { observationOutcomes, recordObservation } from '$lib/server/observations/recordObservation';
import { readPatchBrief } from '$lib/server/observations/readPatchBrief';
import { validateObservation } from '$lib/server/observations/validateObservation';
import { objectSchema, readText, textField } from '../actionTypes';
import { withPatch } from '$lib/server/patches/withPatch';
import type { McpAction } from '../actionTypes';
import type { McpCaller } from '../resolveMcpCaller';
import type { Patch } from '$lib/server/patches/patchRecord';

const patchIdField = textField('The patch id, as given by list_patches');

export const observationActions: McpAction[] = [
	{
		name: 'read_patch_brief',
		area: 'patches',
		audience: 'staff',
		isWrite: false,
		summary: 'what a weekly sweep of a patch should look at: the sectors most in need of a visit, and a page of companies longest unobserved',
		guidance:
			'Work the brief on a weekly scheduled task in your own Claude. For each company, look for anything notable ' +
			'on a public page in the last seven days and record it with record_patch_observation; stop at the end of ' +
			'the page, and take the next page next week with its cursor.',
		inputSchema: objectSchema({ patchId: patchIdField, cursor: textField('Where the last brief stopped — leave out to start') }, ['patchId']),
		run: async (caller, input) => withPatch(caller, input, (patch) => brief(caller, patch, input))
	},
	{
		name: 'record_patch_observation',
		area: 'patches',
		audience: 'staff',
		isWrite: true,
		summary: 'record something notable noticed about a company or a sighted business on a public page, with the page',
		guidance:
			'Public pages only, read in the last seven days, business-contact data only; LinkedIn, X, Facebook and ' +
			'Instagram are refused. A page already recorded for the patch is not recorded twice.',
		inputSchema: objectSchema(
			{
				patchId: patchIdField,
				companyNumber: textField('The company number on the register the observation is about'),
				sightingId: textField('Or the sighting id, for a business not on the register'),
				kind: textField(`What was noticed: ${observationKindOrder.join(', ')}`),
				headline: textField('One line on what was observed'),
				sourceUrl: textField('The public page it was read on')
			},
			['patchId', 'kind', 'headline', 'sourceUrl']
		),
		run: async (caller, input) => withPatch(caller, input, (patch) => observe(caller, patch, input))
	}
];

async function brief(caller: McpCaller, patch: Patch, input: Record<string, unknown>): Promise<string> {
	const cursor = Math.max(0, Number(readText(input, 'cursor')) || 0);
	return describeBrief(patch, await readPatchBrief(caller.supabase, patch, cursor));
}

async function observe(caller: McpCaller, patch: Patch, input: Record<string, unknown>): Promise<string> {
	const seed = {
		companyNumber: readText(input, 'companyNumber').toUpperCase(),
		sightingId: readText(input, 'sightingId'),
		kind: readText(input, 'kind'),
		headline: readText(input, 'headline'),
		sourceUrl: readText(input, 'sourceUrl')
	};
	const refusal = validateObservation(seed);
	if (refusal !== null) return refusal;
	const outcome = await recordObservation(caller.supabase, patch, seed, caller.accountId);
	if (outcome.kind === observationOutcomes.unknownSubject) return 'No company with that number is on the register, and no sighting has that id.';
	if (outcome.kind === observationOutcomes.alreadyRecorded) return 'That page is already recorded for this patch.';
	return `Recorded: ${seed.headline}`;
}
