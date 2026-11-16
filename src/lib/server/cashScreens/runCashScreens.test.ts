import { beforeEach, describe, expect, it, vi } from 'vitest';
import { screenId, screenOf } from './cashScreen.fixture';
import type { CashScreen } from './cashScreenRecord';
import type { ScreenTurnReport } from './carryOnCashScreen';
import type { SupabaseClient } from '@supabase/supabase-js';

const notConfigured = 'Companies House is not configured.';
const companiesHouse = { isConfigured: true };
let screensWaiting: CashScreen[] = [];
let turn: ScreenTurnReport;

vi.mock('$lib/server/companiesHouse/companiesHouseRequest', () => ({ isCompaniesHouseConfigured: () => companiesHouse.isConfigured }));
vi.mock('$lib/server/register/watchRegister', () => ({ companiesHouseNotConfigured: notConfigured }));
vi.mock('./cashScreenWriter', () => ({ readOldestUnfinishedScreen: async () => screensWaiting[0] ?? null }));
vi.mock('./carryOnCashScreen', () => ({
	carryOnCashScreen: async () => {
		if (turn.isFinished) screensWaiting = screensWaiting.slice(1);
		return turn;
	}
}));

const { runCashScreens } = await import('./runCashScreens');
const supabase = {} as SupabaseClient;
const noProgress = async () => undefined;
const cutShort: ScreenTurnReport = { lastDone: '00000046', screenedThisTurn: 46, companiesDone: 46, companyCount: 424, isFinished: false, secondsUntilMoreCalls: 0 };
const finishing: ScreenTurnReport = { ...cutShort, lastDone: '00000424', companiesDone: 424, isFinished: true };

describe('one knock at the cash screens', () => {
	beforeEach(() => {
		companiesHouse.isConfigured = true;
		screensWaiting = [screenOf()];
		turn = cutShort;
	});

	it('is finished at once when no screen is waiting', async () => {
		screensWaiting = [];
		expect(await runCashScreens(supabase, noProgress)).toEqual({ rowsWritten: 0, resumeMarker: '', note: 'No screen waiting.', isFinished: true });
	});

	it('is not finished while its screen has companies left, and says where it stopped', async () => {
		const outcome = await runCashScreens(supabase, noProgress);
		expect(outcome).toEqual({ rowsWritten: 46, resumeMarker: `${screenId}:00000046`, note: `46 companies screened for screen ${screenId}, out of time.`, isFinished: false });
	});

	it('says how long Companies House makes the next knock wait once its calls are spent', async () => {
		turn = { ...cutShort, secondsUntilMoreCalls: 187 };
		const outcome = await runCashScreens(supabase, noProgress);
		expect(outcome.note).toBe(`46 companies screened for screen ${screenId}, stopped until Companies House allows more calls in 187 seconds.`);
	});

	it('is not finished when it finishes one screen and another is waiting, so the knock comes again for that one', async () => {
		screensWaiting = [screenOf(), screenOf({ id: '44444444-4444-4444-8444-444444444444' })];
		turn = finishing;
		const outcome = await runCashScreens(supabase, noProgress);
		expect(outcome).toMatchObject({ note: `46 companies screened for screen ${screenId}, which is finished.`, isFinished: false });
	});

	it('is finished when it finishes the last screen waiting', async () => {
		turn = finishing;
		expect((await runCashScreens(supabase, noProgress)).isFinished).toBe(true);
	});

	it('screens nothing without a Companies House key, and says so', async () => {
		companiesHouse.isConfigured = false;
		expect(await runCashScreens(supabase, noProgress)).toEqual({ rowsWritten: 0, resumeMarker: '', note: notConfigured, isFinished: true });
	});
});
