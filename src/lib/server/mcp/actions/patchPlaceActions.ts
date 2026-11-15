import { asPlaceCategory } from '$lib/data/placeCategory';
import { describePlaceCategories } from './describePlaceCategories';
import { listPlaceCategories } from '$lib/server/premises/listPlaceCategories';
import { objectSchema, readText, textField } from '../actionTypes';
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
	},
	{
		name: 'list_patch_place_categories',
		area: 'patches',
		audience: 'staff',
		isWrite: false,
		summary: 'the categories of trading place a territory holds, the commonest first, each with how many places trade there and how many of those list a phone number, a hundred at most',
		guidance:
			'Call this before narrowing list_patch_premises by category, so the word is one the territory holds. A category is the word Overture Maps files a place under, ' +
			'in the singular with an underscore between its words, and each line starts with it. A territory holds hundreds: a category word narrows the list, ' +
			'and the last line says how many more fit.',
		inputSchema: objectSchema(
			{ patchId: textField('The territory id, as given by list_patches'), category: textField('Keep categories containing this word, such as agent or salon') },
			['patchId']
		),
		run: async (caller, input) => withPatch(caller, input, (patch) => listCategories(caller, patch, readText(input, 'category')))
	}
];

async function loadNow(caller: McpCaller, patch: Patch): Promise<string> {
	const report = await runWatchSource(caller.supabase, patchPlacesSource(patch));
	const nextStep = report.isFinished ? `Next: list_patch_premises with source ${premisesSources.placesDataset} lists them.` : 'Call again to carry on.';
	return `${patch.name}: ${report.note} ${nextStep}`;
}

async function listCategories(caller: McpCaller, patch: Patch, askedFor: string): Promise<string> {
	const word = asPlaceCategory(askedFor);
	const matched = await listPlaceCategories(caller.supabase, patch.id, word);
	return describePlaceCategories(matched, word !== '');
}
