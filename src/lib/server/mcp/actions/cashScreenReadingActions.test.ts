import { beforeEach, describe, expect, it, vi } from 'vitest';
import { cashScreenOutcomes } from '$lib/data/cashScreenOutcome';
import { cashScreenReadingActions } from './cashScreenReadingActions';
import { howToCarryOn } from '$lib/data/cashScreenAnswer';
import { screenId, screenOf } from '$lib/server/cashScreens/cashScreen.fixture';
import type { McpCaller } from '../resolveMcpCaller';

const staff = { accountId: 'staff-1', supabase: {} } as unknown as McpCaller;
const territory = { id: '33333333-3333-4333-8333-333333333333', name: 'Surbiton' };
const passing = { companyNumber: '01234567', name: 'ACME BUILD LTD', outcome: cashScreenOutcomes.passes, reason: 'Cash at bank £150k on 31 Mar 2026.', madeUpTo: '2026-03-31' };
const failing = { companyNumber: '07654321', name: 'SHORT OF IT LTD', outcome: cashScreenOutcomes.fails, reason: 'Cash at bank £12k on 31 Mar 2026, short of £100k.', madeUpTo: '2026-03-31' };

const { territoryRead, screenRead, screensListed, screenWorkedOut } = vi.hoisted(() => ({
	territoryRead: vi.fn(),
	screenRead: vi.fn(),
	screensListed: vi.fn(),
	screenWorkedOut: vi.fn()
}));

vi.mock('$lib/server/cashScreens/cashScreenWriter', () => ({ getCashScreen: screenRead, readScreensOfPatch: screensListed }));
vi.mock('$lib/server/cashScreens/readCashScreen', () => ({ readCashScreen: screenWorkedOut }));
vi.mock('$lib/server/patches/getPatch', () => ({ getPatch: territoryRead }));

function run(name: string, input: Record<string, unknown>) {
	const action = cashScreenReadingActions.find((candidate) => candidate.name === name);
	if (action === undefined) throw new Error(`No action named ${name}`);
	return action.run(staff, input);
}

describe('reading the cash screens of a territory through the connector', () => {
	beforeEach(() => {
		vi.clearAllMocks();
		territoryRead.mockResolvedValue(territory);
		screenRead.mockResolvedValue(screenOf());
		screensListed.mockResolvedValue([screenOf({ companiesDone: 475, finishedAt: '2026-11-15T18:40:00Z' })]);
		screenWorkedOut.mockResolvedValue({ screened: [passing, failing], waiting: 422 });
	});

	it("lists the screens already run on a territory, so one is read and not run again", async () => {
		const answer = await run('list_cash_screens', { patchId: territory.id });
		expect(answer).toContain(`- Screen ${screenId}, SIC codes starting 41, for at least £100k cash at bank, started 15 Nov 2026: finished on 15 Nov 2026.`);
		expect(screensListed).toHaveBeenCalledWith(staff.supabase, territory.id);
	});

	it('lists nothing of a territory that is not there', async () => {
		territoryRead.mockResolvedValue(null);
		expect(await run('list_cash_screens', { patchId: 'not-a-territory' })).toBe('No territory has that id. Call list_patches to see them.');
		expect(screensListed).not.toHaveBeenCalled();
	});

	it('tells whoever reads an unfinished screen how to carry it on', async () => {
		expect(await run('read_cash_screen', { screenId })).toContain(`2 of 424 companies screened so far. ${howToCarryOn}`);
	});

	it('reads a screen with its fails counted and left out, and with them listed when asked', async () => {
		const answer = await run('read_cash_screen', { screenId });
		expect(answer).toContain('- ACME BUILD LTD (01234567)');
		expect(answer).toContain('Fails (1): not listed');
		expect(answer).not.toContain('SHORT OF IT LTD');
		expect(await run('read_cash_screen', { screenId, showFails: true })).toContain('- SHORT OF IT LTD (07654321)');
	});

	it('refuses a showFails that is neither true nor false, and reads nothing', async () => {
		expect(await run('read_cash_screen', { screenId, showFails: 'yes' })).toBe('showFails is true or false, or left out. Nothing was read.');
		expect(screenRead).not.toHaveBeenCalled();
	});

	it('refuses an id no screen has', async () => {
		screenRead.mockResolvedValue(null);
		expect(await run('read_cash_screen', { screenId: 'not-a-screen' })).toBe("No cash screen has that id: list_cash_screens gives a territory's, and start_cash_screen starts one.");
		expect(screenWorkedOut).not.toHaveBeenCalled();
	});
});
