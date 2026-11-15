import { describe, expect, it } from 'vitest';
import { describeCashScreen, describeScreenCover, describeScreenTurn, howToCarryOn, type CashScreenSummary } from './cashScreenAnswer';
import { cashScreenOutcomes } from './cashScreenOutcome';

const screenId = '22222222-2222-4222-8222-222222222222';
const passing = { companyNumber: '01234567', name: 'ACME BUILD LTD', outcome: cashScreenOutcomes.passes, reason: 'Cash at bank of £150k on 31 Mar 2026.', madeUpTo: '2026-03-31' };
const failing = { companyNumber: '07654321', name: 'SHORT OF IT LTD', outcome: cashScreenOutcomes.fails, reason: 'Cash at bank £12k on 31 Mar 2026, short of £100k.', madeUpTo: '2026-03-31' };

function screenOf(facts: Partial<CashScreenSummary>): CashScreenSummary {
	return {
		id: screenId,
		territoryName: 'Surbiton',
		sector: '',
		sicCode: '41',
		leastCash: 100_000,
		startedAt: '2026-11-15T17:30:00Z',
		isFinished: false,
		screened: [passing],
		waiting: 423,
		isListingFails: false,
		...facts
	};
}

describe('what a staff member is told about a cash screen', () => {
	it('says how to carry on a screen that is not finished, because nothing in the background will soon', () => {
		const answer = describeCashScreen(screenOf({}));
		expect(answer).toContain(`1 of 424 companies screened so far. ${howToCarryOn}`);
		expect(answer).toContain('Passes (1):\n- ACME BUILD LTD (01234567)');
	});

	it('says a finished screen is finished, with nothing left to carry on', () => {
		const answer = describeCashScreen(screenOf({ isFinished: true, waiting: 0 }));
		expect(answer).toContain('Finished: all 1 companies screened.');
		expect(answer).not.toContain('carry_on_cash_screen');
	});

	it('counts the fails and leaves them out, since nobody approaches them, and says how to list them', () => {
		const answer = describeCashScreen(screenOf({ screened: [passing, failing] }));
		expect(answer).toContain('Fails (1): not listed, since nobody approaches them: read_cash_screen with showFails true lists each with its reason.');
		expect(answer).not.toContain('SHORT OF IT LTD');
		expect(answer).toContain('- ACME BUILD LTD (01234567)');
	});

	it('lists the fails with their reasons when they are asked for', () => {
		const answer = describeCashScreen(screenOf({ screened: [passing, failing], isListingFails: true }));
		expect(answer).toContain('Fails (1):\n- SHORT OF IT LTD (07654321): Cash at bank £12k on 31 Mar 2026, short of £100k.');
	});

	it('says what a screen covers the same way in its header as in a list', () => {
		expect(describeCashScreen(screenOf({}))).toContain(`Screen ${screenId} of Surbiton, SIC codes starting 41, for at least £100k cash at bank, started 15 Nov 2026.`);
		expect(describeScreenCover({ sector: 'KT6 5', sicCode: '', leastCash: 50_000 })).toBe(', sector KT6 5, for at least £50k cash at bank');
		expect(describeScreenCover({ sector: '', sicCode: '', leastCash: 100_000 })).toBe(', for at least £100k cash at bank');
	});
});

describe('what a staff member is told after carrying a screen on', () => {
	const turn = { screenedThisTurn: 44, companiesDone: 90, companyCount: 424, isFinished: false, secondsUntilMoreCalls: 0 };

	it('says how far the screen has got and to call again while Companies House allows more calls', () => {
		expect(describeScreenTurn(turn)).toBe('44 more companies screened: 90 of 424 so far. Call carry_on_cash_screen again to carry on.');
	});

	it('says how long Companies House makes the next turn wait once its calls are spent', () => {
		const answer = describeScreenTurn({ ...turn, secondsUntilMoreCalls: 187 });
		expect(answer).toBe('44 more companies screened: 90 of 424 so far. Companies House allows no more reading for the next 187 seconds: call carry_on_cash_screen again after that.');
	});

	it('says a screen it finished is finished, and to read it', () => {
		expect(describeScreenTurn({ ...turn, companiesDone: 424, isFinished: true })).toBe('Finished: all 424 companies are screened. Read it with read_cash_screen.');
	});
});
