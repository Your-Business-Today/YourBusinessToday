import { carryOnCashScreen } from '$lib/server/cashScreens/carryOnCashScreen';
import { companiesHouseNotConfigured } from '$lib/server/register/watchRegister';
import { defaultLeastCash, readCashScreenNarrowing } from '$lib/data/cashScreenRules';
import { describeCashScreen, describeScreenTurn, howToCarryOn } from '$lib/data/cashScreenAnswer';
import { getCashScreen, startCashScreen } from '$lib/server/cashScreens/cashScreenWriter';
import { getPatch } from '$lib/server/patches/getPatch';
import { isCompaniesHouseConfigured } from '$lib/server/companiesHouse/companiesHouseRequest';
import { noSuchPatch } from './describePatch';
import { objectSchema, readText, textField } from '../actionTypes';
import { readCashScreen } from '$lib/server/cashScreens/readCashScreen';
import type { CashScreen } from '$lib/server/cashScreens/cashScreenRecord';
import type { McpAction } from '../actionTypes';
import type { McpCaller } from '../resolveMcpCaller';

const noSuchScreen = 'No cash screen has that id: start_cash_screen gives it.';
const alreadyFinished = 'That screen is finished: read it with read_cash_screen.';
const screenIdField = textField('The screen id, as start_cash_screen gave it');
/** One turn stays well inside the time a connector call may take, so the answer always comes back. */
const turnMilliseconds = 100_000;

export const cashScreenActions: McpAction[] = [
	{
		name: 'start_cash_screen',
		area: 'patches',
		audience: 'staff',
		isWrite: true,
		summary: "screen a territory's companies for cash at bank, in the background: each comes back as passes, passes through a connected company, maybe or fails",
		guidance:
			`Hubs and dormant companies are left out. Each company's latest accounts are read, and when its own cash falls short, who is behind it and their accounts. ` +
			`The least cash is ${defaultLeastCash} unless you give another, in whole pounds. ${howToCarryOn}`,
		inputSchema: objectSchema(
			{
				patchId: textField('The territory id, as given by list_patches'),
				sector: textField('Only companies in this postcode sector, such as SM1 4'),
				sicCode: textField('Only companies whose SIC code starts with this, such as 41 or 41202'),
				leastCash: textField(`The least cash at bank a company needs, in whole pounds, digits only; ${defaultLeastCash} when left out`)
			},
			['patchId']
		),
		run: async (caller, input) => startScreen(caller, input)
	},
	{
		name: 'read_cash_screen',
		area: 'patches',
		audience: 'staff',
		isWrite: false,
		summary: 'how far a cash screen has got, and every company it has reached by outcome, with the reason and the day its accounts are made up to',
		guidance: 'Outcomes are worked out as you read, from the readings kept, so a PDF you read and save later changes the answer. Cash is the balance on the made-up day, not today.',
		inputSchema: objectSchema({ screenId: screenIdField }, ['screenId']),
		run: async (caller, input) => readScreen(caller, readText(input, 'screenId'))
	},
	{
		name: 'carry_on_cash_screen',
		area: 'patches',
		audience: 'staff',
		isWrite: true,
		summary: 'screen the next companies of a cash screen now, for about a minute and a half, and say how far it has got',
		guidance:
			'Call it again until it answers that the screen is finished, then read_cash_screen. Companies House allows about fifty companies every five minutes, whoever asks, ' +
			'so a screen of hundreds takes the best part of an hour: narrow a screen by SIC code or sector to keep it short. When the answer says how long Companies House makes it wait, call again after that.',
		inputSchema: objectSchema({ screenId: screenIdField }, ['screenId']),
		run: async (caller, input) => carryOn(caller, readText(input, 'screenId'))
	}
];

async function startScreen(caller: McpCaller, input: Record<string, unknown>): Promise<string> {
	const patch = await getPatch(caller.supabase, readText(input, 'patchId'));
	if (patch === null) return noSuchPatch;
	if (!isCompaniesHouseConfigured()) return companiesHouseNotConfigured;
	const narrowing = readCashScreenNarrowing(readText(input, 'sector'), readText(input, 'sicCode'), readText(input, 'leastCash'));
	if (typeof narrowing === 'string') return narrowing;
	const screen = await startCashScreen(caller.supabase, patch.id, narrowing, caller.accountId);
	return `Started screen ${screen.id} of ${patch.name}. ${howToCarryOn}`;
}

async function carryOn(caller: McpCaller, screenId: string): Promise<string> {
	const screen = await getCashScreen(caller.supabase, screenId);
	if (screen === null) return noSuchScreen;
	if (screen.finishedAt !== null) return alreadyFinished;
	if (!isCompaniesHouseConfigured()) return companiesHouseNotConfigured;
	return describeScreenTurn(await carryOnCashScreen(caller.supabase, screen, Date.now() + turnMilliseconds));
}

async function readScreen(caller: McpCaller, screenId: string): Promise<string> {
	const screen = await getCashScreen(caller.supabase, screenId);
	if (screen === null) return noSuchScreen;
	const patch = await getPatch(caller.supabase, screen.patchId);
	if (patch === null) return noSuchPatch;
	const { screened, waiting } = await readCashScreen(caller.supabase, screen);
	return describeCashScreen({ ...summaryOf(screen), territoryName: patch.name, screened, waiting });
}

function summaryOf(screen: CashScreen) {
	const { id, sector, sicCode, leastCash, startedAt } = screen;
	return { id, sector, sicCode, leastCash, startedAt, isFinished: screen.finishedAt !== null };
}
