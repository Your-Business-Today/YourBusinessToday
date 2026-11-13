import { describe, expect, it } from 'vitest';
import { validateBillingScheduleChange, validateNewBillingSchedule } from './billingScheduleRules';

const today = '2026-11-13';
const accountId = '00000000-0000-4000-8000-000000004000';
const line = { description: 'Monthly fee', quantity: 1, unitPrice: 5100, incomeAccountId: accountId };
const schedule = {
	customerId: '00000000-0000-4000-8000-00000000c0a1',
	title: 'Monthly fees',
	frequency: 'monthly',
	nextInvoiceDate: '2026-12-01',
	covers: 'in_advance',
	sendsByItself: false,
	lines: [line]
};

describe('the rules a billing schedule is kept to', () => {
	it('keeps a new schedule as given, filling in only what the table defaults', () => {
		expect(validateNewBillingSchedule(schedule, today)).toEqual({
			...schedule,
			lines: [{ ...line, costCentreId: null }],
			paymentTermsDays: null,
			notes: '',
			isPaused: false,
			endsOn: null
		});
	});

	it.each([
		['title', 'x'.repeat(121), 'title is at most 120 characters; 121 were given.'],
		['title', '  ', 'title names what the schedule bills'],
		['frequency', 'weekly', 'frequency is one of monthly, quarterly, yearly; "weekly" was given.'],
		['covers', 'advance', 'covers is one of in_advance, in_arrears'],
		['paymentTermsDays', 1.5, 'paymentTermsDays is a whole number from 0'],
		['sendsByItself', 'yes', 'sendsByItself is true or false; "yes" was given.'],
		['endsOn', '2026-11-30', 'endsOn 2026-11-30 is before nextInvoiceDate 2026-12-01'],
		['nextInvoiceDate', '2026-02-30', 'nextInvoiceDate is not a day on the calendar']
	])('refuses %s of %j by name', (field, value, refusal) => {
		expect(validateNewBillingSchedule({ ...schedule, [field]: value }, today)).toContain(refusal);
	});

	it('lets a change end a schedule, and keeps everything left out', () => {
		expect(validateBillingScheduleChange({ endsOn: '2026-11-30' }, today)).toEqual({ endsOn: '2026-11-30' });
		expect(validateBillingScheduleChange({ endsOn: null, isPaused: true }, today)).toEqual({ endsOn: null, isPaused: true });
	});

	it('refuses a change that gives nothing, or a date before today', () => {
		expect(validateBillingScheduleChange({}, today)).toContain('No change was given');
		expect(validateBillingScheduleChange({ nextInvoiceDate: '2026-11-12' }, today)).toContain('is before today, 2026-11-13');
	});
});
