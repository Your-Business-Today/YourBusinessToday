import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
	acmeId, archivedCustomerId, feesId, heldScheduleLines, heldSchedules, holdBooksWithoutSchedules, projectsId, runOnTheBooks as run, today
} from './booksBillingScheduleWorld.fixture';

vi.mock('$lib/server/organisations/getOrganisation', () => ({
	getOrganisation: async (_supabase: unknown, id: string) => ({ id, parentOrganisationId: null, name: 'Your Business Today' })
}));
vi.mock('$lib/server/organisations/getSwitchedOnModules', () => ({ getSwitchedOnModules: async () => ['books'] }));

const sevenLines = [2000, 1000, 800, 600, 400, 200, 100].map((unitPrice, index) => ({
	description: `Service ${index + 1}`,
	quantity: 1,
	unitPrice,
	incomeAccountId: feesId
}));

const monthlyFees = {
	customerId: acmeId,
	title: 'Monthly fees',
	frequency: 'monthly',
	nextInvoiceDate: '2026-12-01',
	covers: 'in_advance',
	sendsByItself: true,
	lines: sevenLines
};

async function setUpMonthlyFees(): Promise<string> {
	await run('create_billing_schedule', monthlyFees);
	return String(heldSchedules()[0].id);
}

describe('a billing schedule set by a person’s Claude', () => {
	beforeEach(() => {
		vi.useFakeTimers({ toFake: ['Date'] });
		vi.setSystemTime(today);
		holdBooksWithoutSchedules();
	});
	afterEach(() => vi.useRealTimers());

	it('reads back its next invoice, total and period once set up', async () => {
		const answer = await run('create_billing_schedule', monthlyFees);
		expect(answer).toContain('Set up in Your Business Today');
		expect(answer).toContain('next invoice 1 Dec 2026, £5,100.00, for December 2026');
		expect(heldScheduleLines()).toHaveLength(sevenLines.length);
		expect(await run('list_billing_schedules', {})).toContain('Monthly fees, billing Acme Ltd');
	});

	it.each([
		['a day of 31', { nextInvoiceDate: '2026-12-31' }, 'falls on day 1 to 28 of a month'],
		['a date before today', { nextInvoiceDate: '2026-11-01' }, 'is before today, 2026-11-13'],
		['no lines', { lines: [] }, 'lines is a list of at least one invoice line'],
		['a total below zero', { lines: [{ ...sevenLines[0], unitPrice: -1 }] }, 'The lines come to -£1.00'],
		['an archived customer', { customerId: archivedCustomerId }, 'is archived'],
		['a missing sendsByItself', { sendsByItself: undefined }, 'sendsByItself is needed, and never assumed'],
		['a price of three places', { lines: [{ ...sevenLines[0], unitPrice: 10.005 }] }, 'at most 2 decimal places']
	])('is refused by name with %s', async (_case, change, refusal) => {
		const answer = await run('create_billing_schedule', { ...monthlyFees, ...change });
		expect(answer).toContain('Nothing was saved.');
		expect(answer).toContain(refusal);
		expect(heldSchedules()).toHaveLength(0);
	});

	it('lets a customer have a second schedule only under its own title', async () => {
		await setUpMonthlyFees();
		const yearlyLicence = { ...monthlyFees, title: 'Yearly licence', frequency: 'yearly', lines: [sevenLines[0]] };
		expect(await run('create_billing_schedule', yearlyLicence)).toContain('Yearly, in advance. Running; next invoice 1 Dec 2026, £2,000.00, for 1 December 2026 to 30 November 2027');
		expect(await run('create_billing_schedule', monthlyFees)).toContain('already has a schedule titled "Monthly fees"');
		expect(heldSchedules()).toHaveLength(2);
	});

	it('takes every line at once, within a cost centre, and keeps the rest', async () => {
		const scheduleId = await setUpMonthlyFees();
		const lines = [{ ...sevenLines[0], costCentreId: projectsId }, { description: 'Discount', quantity: 1, unitPrice: -500, incomeAccountId: feesId }];
		const answer = await run('update_billing_schedule', { scheduleId, lines });
		expect(answer).toContain('next invoice 1 Dec 2026, £1,500.00, for December 2026');
		expect(answer).toContain('cost centre Projects');
		expect(heldScheduleLines()).toHaveLength(2);
	});

	it('is paused, resumed and ended by a change, and reads as it stands', async () => {
		const scheduleId = await setUpMonthlyFees();
		expect(await run('update_billing_schedule', { scheduleId, isPaused: true })).toContain('Paused, so nothing is raised');
		expect(await run('update_billing_schedule', { scheduleId, isPaused: false })).toContain('Running; next invoice');
		expect(await run('update_billing_schedule', { scheduleId, endsOn: '2026-11-30' })).toContain('Ended: nothing is raised after 30 Nov 2026.');
	});

	it('refuses a change to a date before today, a new customer, or a schedule not in the books', async () => {
		const scheduleId = await setUpMonthlyFees();
		expect(await run('update_billing_schedule', { scheduleId, nextInvoiceDate: '2026-11-12' })).toContain('is before today');
		expect(await run('update_billing_schedule', { scheduleId, customerId: archivedCustomerId })).toContain('keeps the customer it bills');
		expect(await run('update_billing_schedule', { scheduleId: projectsId, title: 'Fees' })).toContain('No billing schedule');
		expect(heldSchedules()[0].next_invoice_date).toBe('2026-12-01');
	});
});
