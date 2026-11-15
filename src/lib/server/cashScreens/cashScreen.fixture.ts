import type { CashScreen } from './cashScreenRecord';

export const screenId = '22222222-2222-4222-8222-222222222222';

/** A screen of a territory's builders for £100k, as far on as the facts given say. */
export function screenOf(facts: Partial<CashScreen> = {}): CashScreen {
	return {
		id: screenId,
		patchId: '33333333-3333-4333-8333-333333333333',
		sector: '',
		sicCode: '41',
		leastCash: 100_000,
		startedByAccountId: null,
		startedAt: '2026-11-15T17:30:00Z',
		resumeAfter: '',
		companiesDone: 0,
		finishedAt: null,
		...facts
	};
}
