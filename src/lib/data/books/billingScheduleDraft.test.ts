import { describe, expect, it } from 'vitest';
import { blankScheduleDraft, draftOfSchedule, draftTotal, fieldsOfDraft } from './billingScheduleDraft';
import { readPostedPause, readPostedSchedule } from './billingScheduleFormField';

const feesId = '00000000-0000-4000-8000-000000004000';

describe('the billing schedule form', () => {
	it('starts monthly in advance from the first of next month, with one line and sending left unticked', () => {
		const draft = blankScheduleDraft('2026-11-13', feesId);
		expect(draft).toMatchObject({ frequency: 'monthly', nextInvoiceDate: '2026-12-01', covers: 'in_advance', sendsByItself: false });
		expect(draft.lines).toEqual([{ description: '', quantity: '1', unitPrice: '', incomeAccountId: feesId, costCentreId: '' }]);
		expect(draftTotal(draft)).toBeNull();
	});

	it('posts empty boxes as none and every figure as it was typed', () => {
		const draft = blankScheduleDraft('2026-11-13', feesId);
		draft.lines[0] = { ...draft.lines[0], description: 'Fees', quantity: '2', unitPrice: '2550.005' };
		const fields = fieldsOfDraft(draft);
		expect(fields).toMatchObject({ paymentTermsDays: null, endsOn: null });
		expect(fields.lines).toEqual([{ description: 'Fees', quantity: '2', unitPrice: '2550.005', incomeAccountId: feesId, costCentreId: null }]);
		expect(fieldsOfDraft({ ...draft, paymentTermsDays: '14', endsOn: '2027-03-31' })).toMatchObject({ paymentTermsDays: 14, endsOn: '2027-03-31' });
	});

	it('totals the lines as typed, and shows a schedule the books hold as it stands', () => {
		const held = {
			...blankScheduleDraft('2026-11-13', feesId),
			paymentTermsDays: 14,
			endsOn: null,
			isPaused: false,
			lines: [{ description: 'Fees', quantity: 2, unitPrice: 2550, incomeAccountId: feesId, costCentreId: null }]
		};
		const draft = draftOfSchedule(held);
		expect(draft.paymentTermsDays).toBe('14');
		expect(draft.lines[0]).toMatchObject({ quantity: '2', unitPrice: '2550', costCentreId: '' });
		expect(draftTotal(draft)).toBe(5100);
	});

	it('reads what the form posted, and refuses what it could not have', () => {
		expect(readPostedSchedule(JSON.stringify({ title: 'Monthly fees' }))).toEqual({ title: 'Monthly fees' });
		expect(readPostedSchedule('[1]')).toContain('no schedule');
		expect(readPostedSchedule('{')).toContain('no schedule');
		expect(readPostedSchedule(null)).toContain('no schedule');
		expect(readPostedPause('true')).toBe(true);
		expect(readPostedPause('false')).toBe(false);
		expect(readPostedPause('yes')).toBe('isPaused must be true or false.');
	});
});
