import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { cashScreenActions } from './cashScreenActions';
import { howToCarryOn } from '$lib/data/cashScreenAnswer';
import { screenId, screenOf } from '$lib/server/cashScreens/cashScreen.fixture';
import type { McpCaller } from '../resolveMcpCaller';

const staff = { accountId: 'staff-1', supabase: {} } as unknown as McpCaller;
const territory = { id: '33333333-3333-4333-8333-333333333333', name: 'Surbiton' };
const turnStartedAt = Date.parse('2026-11-15T18:00:00Z');
const oneTurnMilliseconds = 100_000;

const { companiesHouse, screenRead, screenStarted, screenCarriedOn } = vi.hoisted(() => ({
	companiesHouse: { isConfigured: true },
	screenRead: vi.fn(),
	screenStarted: vi.fn(),
	screenCarriedOn: vi.fn()
}));

vi.mock('$lib/server/companiesHouse/companiesHouseRequest', () => ({ isCompaniesHouseConfigured: () => companiesHouse.isConfigured }));
vi.mock('$lib/server/register/watchRegister', () => ({ companiesHouseNotConfigured: 'Companies House is not configured.' }));
vi.mock('$lib/server/cashScreens/cashScreenWriter', () => ({ getCashScreen: screenRead, startCashScreen: screenStarted }));
vi.mock('$lib/server/cashScreens/carryOnCashScreen', () => ({ carryOnCashScreen: screenCarriedOn }));
vi.mock('$lib/server/cashScreens/readCashScreen', () => ({ readCashScreen: async () => ({ screened: [], waiting: 424 }) }));
vi.mock('$lib/server/patches/getPatch', () => ({ getPatch: async () => territory }));

function run(name: string, input: Record<string, unknown>) {
	const action = cashScreenActions.find((candidate) => candidate.name === name);
	if (action === undefined) throw new Error(`No action named ${name}`);
	return action.run(staff, input);
}

describe('screening a territory for cash through the connector', () => {
	beforeEach(() => {
		vi.clearAllMocks();
		companiesHouse.isConfigured = true;
		screenRead.mockResolvedValue(screenOf());
		screenStarted.mockResolvedValue(screenOf());
		screenCarriedOn.mockResolvedValue({ lastDone: '00000044', screenedThisTurn: 44, companiesDone: 44, companyCount: 424, isFinished: false, secondsUntilMoreCalls: 0 });
	});

	afterEach(() => vi.useRealTimers());

	it('starts a screen and says to carry it on, because nothing in the background will soon', async () => {
		expect(await run('start_cash_screen', { patchId: territory.id, sicCode: '41' })).toBe(`Started screen ${screenId} of Surbiton. ${howToCarryOn}`);
	});

	it('tells whoever reads an unfinished screen how to carry it on', async () => {
		expect(await run('read_cash_screen', { screenId })).toContain(`0 of 424 companies screened so far. ${howToCarryOn}`);
	});

	it('carries a screen on for a hundred seconds, well inside the time a connector call may take, and says how far it has got', async () => {
		vi.useFakeTimers({ now: turnStartedAt });
		expect(await run('carry_on_cash_screen', { screenId })).toBe('44 more companies screened: 44 of 424 so far. Call carry_on_cash_screen again to carry on.');
		expect(screenCarriedOn).toHaveBeenCalledWith(staff.supabase, screenOf(), turnStartedAt + oneTurnMilliseconds);
	});

	it('screens nothing more of a screen that is finished, and says to read it', async () => {
		screenRead.mockResolvedValue(screenOf({ finishedAt: '2026-11-15T18:30:00Z' }));
		expect(await run('carry_on_cash_screen', { screenId })).toBe('That screen is finished: read it with read_cash_screen.');
		expect(screenCarriedOn).not.toHaveBeenCalled();
	});

	it('refuses an id no screen has', async () => {
		screenRead.mockResolvedValue(null);
		expect(await run('carry_on_cash_screen', { screenId: 'not-a-screen' })).toBe('No cash screen has that id: start_cash_screen gives it.');
		expect(screenCarriedOn).not.toHaveBeenCalled();
	});

	it('screens nothing without a Companies House key, and says so', async () => {
		companiesHouse.isConfigured = false;
		expect(await run('carry_on_cash_screen', { screenId })).toBe('Companies House is not configured.');
		expect(screenCarriedOn).not.toHaveBeenCalled();
	});
});
