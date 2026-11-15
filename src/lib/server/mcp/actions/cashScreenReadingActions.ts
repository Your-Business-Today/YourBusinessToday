import { describeCashScreen, noSuchScreen } from '$lib/data/cashScreenAnswer';
import { describeCashScreenList } from '$lib/data/cashScreenListAnswer';
import { getCashScreen, readScreensOfPatch } from '$lib/server/cashScreens/cashScreenWriter';
import { getPatch } from '$lib/server/patches/getPatch';
import { noSuchPatch } from './describePatch';
import { objectSchema, readOptionalFlag, readText, textField } from '../actionTypes';
import { readCashScreen } from '$lib/server/cashScreens/readCashScreen';
import { screenIdField } from './cashScreenActions';
import { withPatch } from '$lib/server/patches/withPatch';
import type { CashScreen } from '$lib/server/cashScreens/cashScreenRecord';
import type { McpAction } from '../actionTypes';
import type { McpCaller } from '../resolveMcpCaller';
import type { Patch } from '$lib/server/patches/patchRecord';

const showFailsField = { type: 'boolean', description: 'True to list the fails as well, each with its reason; left out, they are only counted' };
const showFailsRefusal = 'showFails is true or false, or left out. Nothing was read.';

/** What staff read of a territory's cash screens: which have been run, and what one found. */
export const cashScreenReadingActions: McpAction[] = [
	{
		name: 'list_cash_screens',
		area: 'patches',
		audience: 'staff',
		isWrite: false,
		summary: 'the cash screens already run on a territory, the newest first: what each was narrowed to, the least cash, the day it started and how far it has got',
		guidance: 'Call it before start_cash_screen: a screen already run for the same trade and cash is read with read_cash_screen, not run again, because a screen of hundreds takes the best part of an hour.',
		inputSchema: objectSchema({ patchId: textField('The territory id, as given by list_patches') }, ['patchId']),
		run: async (caller, input) => withPatch(caller, input, (patch) => listScreens(caller, patch))
	},
	{
		name: 'read_cash_screen',
		area: 'patches',
		audience: 'staff',
		isWrite: false,
		summary: 'how far a cash screen has got, and the companies it has reached by outcome, with the reason and the day its accounts are made up to: the fails are counted, and listed only when asked for',
		guidance: 'Outcomes are worked out as you read, from the readings kept, so a PDF you read and save later changes the answer. Cash is the balance on the made-up day, not today.',
		inputSchema: objectSchema({ screenId: screenIdField, showFails: showFailsField }, ['screenId']),
		run: async (caller, input) => readScreen(caller, input)
	}
];

async function listScreens(caller: McpCaller, patch: Patch): Promise<string> {
	return describeCashScreenList(patch.name, await readScreensOfPatch(caller.supabase, patch.id));
}

async function readScreen(caller: McpCaller, input: Record<string, unknown>): Promise<string> {
	const isListingFails = readOptionalFlag(input, 'showFails');
	if (isListingFails === null) return showFailsRefusal;
	const screen = await getCashScreen(caller.supabase, readText(input, 'screenId'));
	if (screen === null) return noSuchScreen;
	const patch = await getPatch(caller.supabase, screen.patchId);
	if (patch === null) return noSuchPatch;
	const { screened, waiting } = await readCashScreen(caller.supabase, screen);
	return describeCashScreen({ ...summaryOf(screen), territoryName: patch.name, screened, waiting, isListingFails });
}

function summaryOf(screen: CashScreen) {
	const { id, sector, sicCode, leastCash, startedAt } = screen;
	return { id, sector, sicCode, leastCash, startedAt, isFinished: screen.finishedAt !== null };
}
