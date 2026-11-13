import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { blankOrganisationDetails } from '$lib/data/organisationRules';
import { heldSchedule, holdBooksForTheRun, monthlyFees, raisedInvoices, run } from './booksBillingRunWorld.fixture';

vi.mock('$lib/server/email/sendTransactionalEmail', () => ({ sendTransactionalEmail: async () => 'sent' }));
vi.mock('$lib/server/organisations/getOrganisation', () => ({
	getOrganisation: async (_supabase: unknown, id: string) => ({ ...blankOrganisationDetails, id, parentOrganisationId: null, name: 'Your Business Today' })
}));
vi.mock('$lib/server/organisations/getSwitchedOnModules', () => ({ getSwitchedOnModules: async () => ['books'] }));

async function raiseOn(day: string, schedule: Record<string, unknown>): Promise<Record<string, unknown>> {
	vi.setSystemTime(new Date('2026-11-13T09:00:00Z'));
	expect(await run('create_billing_schedule', schedule)).toContain('Set up in');
	vi.setSystemTime(new Date(`${day}T09:00:00Z`));
	await run('run_billing_schedules', {});
	return raisedInvoices()[0];
}

describe('the period each invoice raised from a schedule bills', () => {
	beforeEach(() => {
		vi.useFakeTimers({ toFake: ['Date'] });
		holdBooksForTheRun();
	});
	afterEach(() => vi.useRealTimers());

	it('reads November 2026 for a monthly schedule in arrears on 1 December', async () => {
		const invoice = await raiseOn('2026-12-01', monthlyFees('2026-12-01', { covers: 'in_arrears' }));
		expect(invoice).toEqual(expect.objectContaining({ reference: 'Monthly fees: November 2026', period_start: '2026-11-01', period_end: '2026-11-30' }));
	});

	it('bills a quarter ahead to the last day of February, and moves on a quarter', async () => {
		const quarterly = monthlyFees('2026-12-01', { title: 'Quarterly fees', frequency: 'quarterly' });
		const invoice = await raiseOn('2026-12-01', quarterly);
		expect(invoice.reference).toBe('Quarterly fees: 1 December 2026 to 28 February 2027');
		expect(invoice.period_end).toBe('2027-02-28');
		expect(heldSchedule().next_invoice_date).toBe('2027-03-01');
	});

	it('bills the quarter just gone to the last day of November', async () => {
		const quarterly = monthlyFees('2026-12-01', { title: 'Quarterly fees', frequency: 'quarterly', covers: 'in_arrears' });
		expect((await raiseOn('2026-12-01', quarterly)).reference).toBe('Quarterly fees: 1 September 2026 to 30 November 2026');
	});

	it('bills a year in arrears to the last day of February, and moves on a year', async () => {
		const yearly = monthlyFees('2027-03-01', { title: 'Yearly licence', frequency: 'yearly', covers: 'in_arrears' });
		const invoice = await raiseOn('2027-03-01', yearly);
		expect(invoice.reference).toBe('Yearly licence: 1 March 2026 to 28 February 2027');
		expect(heldSchedule().next_invoice_date).toBe('2028-03-01');
	});

	it('raises nothing before the next invoice date, nor from a paused schedule', async () => {
		expect(await raiseOn('2026-11-30', monthlyFees('2026-12-01'))).toBeUndefined();
		heldSchedule().is_paused = true;
		vi.setSystemTime(new Date('2026-12-01T09:00:00Z'));
		expect(await run('run_billing_schedules', {})).toContain('Nothing was due');
	});
});
