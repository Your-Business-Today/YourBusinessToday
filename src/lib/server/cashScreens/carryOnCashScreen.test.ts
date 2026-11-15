import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { noteRateWindow, RateBudgetSpent } from '$lib/server/companiesHouse/rateBudget';
import { screenId, screenOf } from './cashScreen.fixture';
import type { SupabaseClient } from '@supabase/supabase-js';

const companyNumbers = ['00000001', '00000002', '00000003'];
const suppressedCompany = '00000009';
const marks: string[] = [];
const finished: string[] = [];
let failures: Record<string, Error> = {};

vi.mock('./companiesToScreen', () => ({ companiesToScreen: async () => [...companyNumbers, suppressedCompany].map((companyNumber) => ({ companyNumber })) }));
vi.mock('$lib/server/register/registerWriter', () => ({ readSuppressedCompanies: async () => new Set([suppressedCompany]) }));
vi.mock('./cashScreenWriter', () => ({
	markScreenProgress: async (_supabase: unknown, _screenId: string, companyNumber: string, companiesDone: number) => {
		marks.push(`${companyNumber}:${companiesDone}`);
	},
	finishCashScreen: async (_supabase: unknown, finishedScreenId: string) => {
		finished.push(finishedScreenId);
	}
}));
vi.mock('./screenOneCompany', () => ({
	screenOneCompany: async (_supabase: unknown, companyNumber: string) => {
		if (failures[companyNumber] !== undefined) throw failures[companyNumber];
	}
}));

const { carryOnCashScreen } = await import('./carryOnCashScreen');
const supabase = {} as SupabaseClient;
const millisecondsPerSecond = 1000;
const inAMinute = () => Date.now() + 60_000;

function rateWindow(remaining: number, resetsInSeconds: number): Headers {
	const resetsAtSeconds = Math.ceil(Date.now() / millisecondsPerSecond) + resetsInSeconds;
	return new Headers({ 'X-Ratelimit-Remain': String(remaining), 'X-Ratelimit-Reset': String(resetsAtSeconds) });
}

describe('one turn at a cash screen', () => {
	beforeEach(() => {
		marks.length = 0;
		finished.length = 0;
		failures = {};
	});

	afterEach(() => noteRateWindow(rateWindow(599, 300)));

	it('screens every company but the suppressed ones, tells whoever else keeps a record, and stamps the screen finished', async () => {
		const told: string[] = [];
		const report = await carryOnCashScreen(supabase, screenOf(), inAMinute(), async (companyNumber, companiesDone) => void told.push(`${companyNumber}:${companiesDone}`));
		expect(report).toEqual({ lastDone: '00000003', screenedThisTurn: 3, companiesDone: 3, companyCount: 3, isFinished: true, secondsUntilMoreCalls: 0 });
		expect(marks).toEqual(['00000001:1', '00000002:2', '00000003:3']);
		expect(told).toEqual(marks);
		expect(finished).toEqual([screenId]);
	});

	it('leaves whole the company Companies House allowed no more calls for, and says how long the next turn has to wait', async () => {
		failures = { '00000003': new RateBudgetSpent() };
		noteRateWindow(rateWindow(0, 200));
		const report = await carryOnCashScreen(supabase, screenOf({ resumeAfter: '00000001', companiesDone: 1 }), inAMinute());
		expect(report).toMatchObject({ lastDone: '00000002', screenedThisTurn: 1, companiesDone: 2, companyCount: 3, isFinished: false });
		expect(report.secondsUntilMoreCalls).toBeGreaterThan(190);
		expect(marks).toEqual(['00000002:2']);
		expect(finished).toEqual([]);
	});

	it('stops when its time is up, with nothing to wait for while Companies House still allows calls', async () => {
		const alreadyPast = Date.now() - 1;
		const report = await carryOnCashScreen(supabase, screenOf(), alreadyPast);
		expect(report).toMatchObject({ screenedThisTurn: 0, isFinished: false, secondsUntilMoreCalls: 0 });
	});

	it('fails on any other fault, so a company that cannot be read is never passed over as screened', async () => {
		failures = { '00000002': new Error('Companies House answered with status 500') };
		await expect(carryOnCashScreen(supabase, screenOf(), inAMinute())).rejects.toThrow('status 500');
		expect(marks).toEqual(['00000001:1']);
	});
});
