import type { CashScreenNarrowing } from '$lib/data/cashScreenRules';

/** One screen of a territory for cash, and how far the watcher has got through it. */
export type CashScreen = CashScreenNarrowing & {
	id: string;
	patchId: string;
	startedByAccountId: string | null;
	startedAt: string;
	resumeAfter: string;
	companiesDone: number;
	finishedAt: string | null;
};

export const cashScreenColumns = 'id, patch_id, sector, sic_code, least_cash, started_by_account_id, started_at, resume_after, companies_done, finished_at';

export function parseCashScreen(row: Record<string, unknown>): CashScreen {
	return {
		id: row.id as string,
		patchId: row.patch_id as string,
		sector: (row.sector ?? '') as string,
		sicCode: (row.sic_code ?? '') as string,
		leastCash: Number(row.least_cash),
		startedByAccountId: (row.started_by_account_id ?? null) as string | null,
		startedAt: row.started_at as string,
		resumeAfter: (row.resume_after ?? '') as string,
		companiesDone: Number(row.companies_done ?? 0),
		finishedAt: (row.finished_at ?? null) as string | null
	};
}
