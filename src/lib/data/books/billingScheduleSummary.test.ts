import { describe, expect, it } from 'vitest';
import { summariseBillingSchedule, type ScheduleToSummarise } from './billingScheduleSummary';

const feesId = '00000000-0000-4000-8000-000000004000';

const monthlyFees: ScheduleToSummarise = {
	title: 'Monthly fees',
	frequency: 'monthly',
	nextInvoiceDate: '2026-12-01',
	covers: 'in_advance',
	paymentTermsDays: 14,
	sendsByItself: true,
	notes: '',
	isPaused: false,
	endsOn: null,
	lines: [{ description: 'Fees', quantity: 1, unitPrice: 5100, incomeAccountId: feesId, costCentreId: null }]
};

const booksOwnDays = 30;

describe('summariseBillingSchedule', () => {
	it('reads a schedule at a glance', () => {
		expect(summariseBillingSchedule(monthlyFees, booksOwnDays)).toBe(
			'£5,100.00 every month on the 1st, in advance. 14 days to pay. Sends by itself. Next invoice 1 Dec 2026.'
		);
	});

	it("names the day of each quarter or year, in arrears, on the books' own days, waiting as a draft", () => {
		const quarterly = { ...monthlyFees, frequency: 'quarterly', nextInvoiceDate: '2026-12-22', covers: 'in_arrears', paymentTermsDays: null } as const;
		expect(summariseBillingSchedule(quarterly, booksOwnDays)).toBe(
			'£5,100.00 every quarter on the 22nd, in arrears. 30 days to pay. Sends by itself. Next invoice 22 Dec 2026.'
		);
		const yearly = { ...monthlyFees, frequency: 'yearly', nextInvoiceDate: '2027-03-03', sendsByItself: false, paymentTermsDays: 1 } as const;
		expect(summariseBillingSchedule(yearly, booksOwnDays)).toBe(
			'£5,100.00 every year on 3 March, in advance. 1 day to pay. Each invoice waits as a draft to issue by hand. Next invoice 3 Mar 2027.'
		);
	});

	it('says when a schedule is paused or has ended', () => {
		expect(summariseBillingSchedule({ ...monthlyFees, isPaused: true }, booksOwnDays)).toContain(
			'Paused: nothing is raised until it is resumed, then next invoice 1 Dec 2026.'
		);
		expect(summariseBillingSchedule({ ...monthlyFees, endsOn: '2026-11-30' }, booksOwnDays)).toContain('Ended: nothing is raised after 30 Nov 2026.');
	});
});
