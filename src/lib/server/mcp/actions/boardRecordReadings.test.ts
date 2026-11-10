import { beforeEach, describe, expect, it, vi } from 'vitest';
import { takeBoardRecordReading } from './boardRecordReadings';
import { boardRecordPaperRefusals, moduleSwitchedOffForSource } from '$lib/data/boardroomRecordPaperRules';
import type { BoardRecordAsked } from '$lib/data/boardroomRecordPaper';

const records = vi.hoisted(() => ({ usableModules: [] as string[], project: null as Record<string, unknown> | null, booksRead: 0 }));

vi.mock('../organisationModuleGate', () => ({
	usableModuleOrganisation: async (_caller: unknown, organisationId: string, module: string) =>
		records.usableModules.includes(module) ? { id: organisationId } : null
}));
vi.mock('../projectAccess', () => ({ reachableProject: async () => records.project }));
vi.mock('./projectStateReading', () => ({ describeHowProjectStands: async () => '# Portal: On track' }));
vi.mock('./boardRecordBooksReadings', () => ({
	takeTrialBalance: async () => ({ reading: `Trial balance ${++records.booksRead}` }),
	takeBalanceSheet: async () => ({ reading: 'Balance sheet' }),
	takeProfitAndLoss: async () => ({ reading: 'Profit and loss' })
}));

const caller = { supabase: {} } as never;
const yourBusinessToday = { id: 'ybt', name: 'Your Business Today' } as never;
const nothingAsked = { periodStart: null, periodEnd: null, costCentreId: null, recordId: null };
const trialBalance: BoardRecordAsked = { ...nothingAsked, source: 'trial_balance', periodEnd: '2026-10-31' };
const progress: BoardRecordAsked = { ...nothingAsked, source: 'project_progress', recordId: 'portal' };

describe('taking a reading from the records for a board paper', () => {
	beforeEach(() => {
		records.usableModules = ['books', 'boardroom'];
		records.project = { id: 'portal', name: 'Portal', organisationId: 'ybt' };
		records.booksRead = 0;
	});

	it('reads the books only when Books is switched on for the organisation and the director', async () => {
		expect(await takeBoardRecordReading(caller, yourBusinessToday, trialBalance)).toEqual({ reading: 'Trial balance 1' });
		records.usableModules = ['boardroom'];
		expect(await takeBoardRecordReading(caller, yourBusinessToday, trialBalance)).toBe(moduleSwitchedOffForSource('trial_balance', 'Books'));
		expect(records.booksRead).toBe(1);
	});

	it('refuses a page of Your Business Brain while that module is off', async () => {
		const page: BoardRecordAsked = { ...nothingAsked, source: 'business_brain_page', recordId: 'page' };
		const refusal = moduleSwitchedOffForSource('business_brain_page', 'Your Business Brain');
		expect(await takeBoardRecordReading(caller, yourBusinessToday, page)).toBe(refusal);
	});

	it("reads a project's progress only for a project of this organisation that the director is on", async () => {
		expect(await takeBoardRecordReading(caller, yourBusinessToday, progress)).toEqual({ reading: '# Portal: On track' });
		records.project = { id: 'portal', name: 'Portal', organisationId: 'another' };
		expect(await takeBoardRecordReading(caller, yourBusinessToday, progress)).toBe(boardRecordPaperRefusals.noSuchProject);
		records.project = null;
		expect(await takeBoardRecordReading(caller, yourBusinessToday, progress)).toBe(boardRecordPaperRefusals.noSuchProject);
	});
});
