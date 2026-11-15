import { describe, expect, it } from 'vitest';
import { describeCashScreen, describeScreenTurn, howToCarryOn, type CashScreenSummary } from './cashScreenAnswer';
import { cashScreenOutcomes } from './cashScreenOutcome';

const screenId = '22222222-2222-4222-8222-222222222222';
const passing = { companyNumber: '01234567', name: 'ACME BUILD LTD', outcome: cashScreenOutcomes.passes, reason: 'Cash at bank of £150k on 31 Mar 2026.', madeUpTo: '2026-03-31' };

function screenOf(facts: Partial<CashScreenSummary>): CashScreenSummary {
	return { id: screenId, territoryName: 'Surbiton', sector: '', sicCode: '41', leastCash: 100_000, startedAt: '2026-11-15T17:30:00Z', isFinished: false, screened: [passing], waiting: 423, ...facts };
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
