import { describeCoverageList, describeSectorInFull, describeSectorList, noSuchSector } from './describeSector';
import { describeSearchOutcome } from '$lib/server/sectors/sectorOutcomeSentences';
import { getAccountsById } from '$lib/server/accounts/getAccountsById';
import { parseSearchSource, searchSourceOrder } from '$lib/data/searchSources';
import { readPatchCoverage, unsearchedFirst } from '$lib/server/sectors/patchCoverage';
import { readSector } from '$lib/server/sectors/readSector';
import { recordSectorSearch } from '$lib/server/sectors/recordSectorSearch';
import { validateSectorSearch } from '$lib/data/sectorSearchRules';
import { objectSchema, readText, textField } from '../actionTypes';
import { withPatch } from './withPatch';
import type { McpAction } from '../actionTypes';
import type { McpCaller } from '../resolveMcpCaller';
import type { Patch } from '$lib/server/patches/patchRecord';

const patchIdField = textField('The patch id, as given by list_patches');
const sectorField = textField('The sector, such as KT1 1');

export const sectorActions: McpAction[] = [
	{
		name: 'list_patch_sectors',
		area: 'patches',
		audience: 'staff',
		isWrite: false,
		summary: 'every postcode sector in a patch, residential ones included',
		inputSchema: objectSchema({ patchId: patchIdField }, ['patchId']),
		run: async (caller, input) => withPatch(caller, input, async (patch) => describeSectorList((await readPatchCoverage(caller.supabase, patch)).sectors))
	},
	{
		name: 'list_unsearched_sectors',
		area: 'patches',
		audience: 'staff',
		isWrite: false,
		summary: 'the sectors of a patch still to be worked, never searched first, then the longest ago',
		guidance: 'Choose the next sector from the top of this list, claim it with claim_sector, then read it with read_sector before searching.',
		inputSchema: objectSchema({ patchId: patchIdField }, ['patchId']),
		run: async (caller, input) => withPatch(caller, input, (patch) => listUnsearched(caller, patch))
	},
	{
		name: 'read_sector',
		area: 'patches',
		audience: 'staff',
		isWrite: false,
		summary: 'one sector: its coverage, every search made of it with who and when, and how many companies are registered there',
		inputSchema: objectSchema({ patchId: patchIdField, sector: sectorField }, ['patchId', 'sector']),
		run: async (caller, input) => withPatch(caller, input, (patch) => readOneSector(caller, patch, readText(input, 'sector').toUpperCase()))
	},
	{
		name: 'mark_sector_searched',
		area: 'patches',
		audience: 'staff',
		isWrite: true,
		summary: 'record that you have searched a sector: the source, how many businesses you found, and one line on what was done',
		guidance:
			'Claim before you search, and mark searched only what you claimed or own. The summary is what a ' +
			'colleague reads to judge the coverage, so say what was searched and what was found in one line.',
		inputSchema: objectSchema(
			{
				patchId: patchIdField,
				sector: sectorField,
				source: textField(`What was searched: ${searchSourceOrder.join(', ')}`),
				foundCount: textField('How many businesses the search found, as a whole number'),
				summary: textField('One line on what was searched and found')
			},
			['patchId', 'sector', 'source', 'foundCount', 'summary']
		),
		run: async (caller, input) => withPatch(caller, input, (patch) => markSearched(caller, patch, input))
	}
];

async function listUnsearched(caller: McpCaller, patch: Patch): Promise<string> {
	const { coverage } = await readPatchCoverage(caller.supabase, patch);
	const needed = unsearchedFirst(coverage);
	const claimants = needed.flatMap((entry) => (entry.claimedByAccountId === null ? [] : [entry.claimedByAccountId]));
	return describeCoverageList(needed, await getAccountsById(caller.supabase, claimants));
}

async function readOneSector(caller: McpCaller, patch: Patch, sectorName: string): Promise<string> {
	const reading = await readSector(caller.supabase, patch, sectorName);
	if (reading === null) return noSuchSector;
	return describeSectorInFull(reading);
}

async function markSearched(caller: McpCaller, patch: Patch, input: Record<string, unknown>): Promise<string> {
	const seed = {
		sector: readText(input, 'sector').toUpperCase(),
		source: readText(input, 'source'),
		foundCount: Number(readText(input, 'foundCount')),
		summary: readText(input, 'summary')
	};
	const refusal = validateSectorSearch(seed);
	const source = parseSearchSource(seed.source);
	if (refusal !== null || source === null) return refusal ?? '';
	const outcome = await recordSectorSearch(caller.supabase, patch, { ...seed, source }, caller.accountId);
	return describeSearchOutcome(caller.supabase, outcome, seed.sector);
}
