import { describe, expect, it } from 'vitest';
import { validateBoardroomRecordPaper } from './validateBoardroomRecordPaper';
import { boardPaperRefusals } from './boardroomPaperRules';
import { boardRecordPaperRefusals, fieldNeededForSource, fieldNotForSource } from './boardroomRecordPaperRules';

const projectId = '3f1c2b4a-5d6e-4f70-8a9b-0c1d2e3f4a5b';
const trialBalance = { itemNumber: 2, title: 'Trial balance to October', source: 'trial_balance', asAt: '2026-10-31' };

describe('checking a paper taken from the records', () => {
	it('reads a trial balance at the end of its day', () => {
		expect(validateBoardroomRecordPaper(trialBalance)).toEqual({
			itemNumber: 2,
			title: 'Trial balance to October',
			asked: { source: 'trial_balance', periodStart: null, periodEnd: '2026-10-31', costCentreId: null, recordId: null }
		});
	});

	it('reads a profit and loss over its days, and a project by its id', () => {
		const profitAndLoss = { ...trialBalance, source: 'profit_and_loss', asAt: undefined, periodStart: '2026-10-01', periodEnd: '2026-10-31' };
		const draft = validateBoardroomRecordPaper(profitAndLoss);
		expect(draft).toMatchObject({ asked: { periodStart: '2026-10-01', periodEnd: '2026-10-31' } });
		const progress = validateBoardroomRecordPaper({ ...trialBalance, source: 'project_progress', asAt: undefined, projectId });
		expect(progress).toMatchObject({ asked: { source: 'project_progress', recordId: projectId, periodEnd: null } });
	});

	it('refuses a source it does not know, and an item or title that does not fit', () => {
		expect(validateBoardroomRecordPaper({ ...trialBalance, source: 'bank_feed' })).toBe(boardRecordPaperRefusals.sourceNotKnown);
		expect(validateBoardroomRecordPaper({ ...trialBalance, itemNumber: 0 })).toBe(boardPaperRefusals.itemNumberNotANumber);
		expect(validateBoardroomRecordPaper({ ...trialBalance, title: 'x'.repeat(201) })).toBe(boardPaperRefusals.titleMissing);
	});

	it('refuses a field the source is not read by, and one it needs left out', () => {
		const withCostCentre = { ...trialBalance, costCentreId: projectId };
		expect(validateBoardroomRecordPaper(withCostCentre)).toBe(fieldNotForSource('costCentreId', 'trial_balance'));
		const page = { ...trialBalance, source: 'business_brain_page', asAt: undefined };
		expect(validateBoardroomRecordPaper(page)).toBe(fieldNeededForSource('pageId', 'business_brain_page'));
	});

	it('refuses a day that is not on the calendar and an id that is not an id', () => {
		expect(validateBoardroomRecordPaper({ ...trialBalance, asAt: '2026-02-30' })).toContain('asAt is not a day on the calendar');
		const progress = { ...trialBalance, source: 'project_progress', asAt: undefined, projectId: 'mine' };
		expect(validateBoardroomRecordPaper(progress)).toContain('The projectId must be an id');
	});
});
