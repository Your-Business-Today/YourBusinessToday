import { describe, expect, it } from 'vitest';
import { describeCashScreenList, type ListedCashScreen } from './cashScreenListAnswer';

const buildersId = '22222222-2222-4222-8222-222222222222';
const electriciansId = '44444444-4444-4444-8444-444444444444';

function screenOf(facts: Partial<ListedCashScreen>): ListedCashScreen {
	return { id: buildersId, sector: '', sicCode: '41', leastCash: 100_000, startedAt: '2026-11-15T13:05:00Z', companiesDone: 475, finishedAt: '2026-11-15T18:40:00Z', ...facts };
}

describe("what a staff member's Claude is told of the screens a territory has", () => {
	it('says a territory with none has none, and how one is started', () => {
		expect(describeCashScreenList('Surbiton', [])).toBe('No cash screen has been run on Surbiton yet: start_cash_screen starts one.');
	});

	it('gives each screen with what it covers, the day it started and how far it has got, and says how one is read or carried on', () => {
		const electricians = screenOf({ id: electriciansId, sicCode: '4321', leastCash: 50_000, startedAt: '2026-11-16T09:00:00Z', companiesDone: 120, finishedAt: null });
		expect(describeCashScreenList('Surbiton', [electricians, screenOf({})]).split('\n')).toEqual([
			'Cash screens of Surbiton, the newest first. Read one with read_cash_screen; one that is not finished is carried on with carry_on_cash_screen.',
			`- Screen ${electriciansId}, SIC codes starting 4321, for at least £50k cash at bank, started 16 Nov 2026: 120 companies screened so far.`,
			`- Screen ${buildersId}, SIC codes starting 41, for at least £100k cash at bank, started 15 Nov 2026: finished on 15 Nov 2026.`
		]);
	});
});
