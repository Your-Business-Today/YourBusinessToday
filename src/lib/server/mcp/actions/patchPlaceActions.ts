import { objectSchema, textField } from '../actionTypes';
import { patchPlacesSource } from '$lib/server/watch/patchPlacesSource';
import { premisesSources } from '$lib/data/foodHygieneRules';
import { runWatchSource } from '$lib/server/watch/runWatchSource';
import { withPatch } from '$lib/server/patches/withPatch';
import type { McpAction } from '../actionTypes';
import type { McpCaller } from '../resolveMcpCaller';
import type { Patch } from '$lib/server/patches/patchRecord';

export const patchPlaceActions: McpAction[] = [
	{
		name: 'load_patch_places',
		area: 'patches',
		audience: 'staff',
		isWrite: true,
		summary: "load a territory's trading places, with the phone number and website of each, from the newest release of Overture Maps, carrying on from the last call",
		guidance:
			'The site loads the trading places of every territory by itself overnight, so call this only for a territory made today or one whose load stopped part way. ' +
			'Call it again until it answers that the territory holds the release: each call writes for about a minute and a half and carries on where the last stopped. ' +
			'Then list_patch_premises lists them, narrowed by source, sector or category.',
		inputSchema: objectSchema({ patchId: textField('The territory id, as given by list_patches') }, ['patchId']),
		run: async (caller, input) => withPatch(caller, input, (patch) => loadNow(caller, patch))
	}
];

async function loadNow(caller: McpCaller, patch: Patch): Promise<string> {
	const report = await runWatchSource(caller.supabase, patchPlacesSource(patch));
	const nextStep = report.isFinished ? `Next: list_patch_premises with source ${premisesSources.placesDataset} lists them.` : 'Call again to carry on.';
	return `${patch.name}: ${report.note} ${nextStep}`;
}
