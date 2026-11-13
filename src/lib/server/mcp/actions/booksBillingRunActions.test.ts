import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { blankOrganisationDetails } from '$lib/data/organisationRules';
import type { TransactionalEmail } from '$lib/server/email/sendTransactionalEmail';
import { archivedCustomerId } from './booksBillingScheduleWorld.fixture';
import { ledgerTables } from './booksLedgerDatabase.fixture';
import { heldSchedule, holdBooksForTheRun, monthlyFees, raisedInvoices, run, sendings } from './booksBillingRunWorld.fixture';

const outbox = vi.hoisted(() => ({ emails: [] as TransactionalEmail[], delivery: 'sent' as 'sent' | 'skipped' | 'failed' }));
vi.mock('$lib/server/email/sendTransactionalEmail', () => ({
	sendTransactionalEmail: async (email: TransactionalEmail) => (outbox.emails.push(email), outbox.delivery)
}));
vi.mock('$lib/server/organisations/getOrganisation', () => ({
	getOrganisation: async (_supabase: unknown, id: string) => ({ ...blankOrganisationDetails, id, parentOrganisationId: null, name: 'Your Business Today' })
}));
vi.mock('$lib/server/organisations/getSwitchedOnModules', () => ({ getSwitchedOnModules: async () => ['books'] }));

const firstOfDecember = new Date('2026-12-01T09:00:00Z');

async function setUpOn(day: string, schedule: Record<string, unknown>): Promise<void> {
	vi.setSystemTime(new Date(`${day}T09:00:00Z`));
	expect(await run('create_billing_schedule', schedule)).toContain('Set up in');
	vi.setSystemTime(firstOfDecember);
}

describe('run_billing_schedules', () => {
	beforeEach(() => {
		vi.useFakeTimers({ toFake: ['Date'] });
		outbox.emails = [];
		outbox.delivery = 'sent';
		holdBooksForTheRun();
	});
	afterEach(() => vi.useRealTimers());

	it('raises, issues and sends a monthly invoice due today, and does nothing on a second run that day', async () => {
		await setUpOn('2026-11-13', monthlyFees('2026-12-01'));
		const answer = await run('run_billing_schedules', {});
		expect(answer).toContain('Invoices raised 1, issued 1, sent 1.');
		expect(answer).toContain('Raised INV-7 to Acme Ltd, £5,100.00, for Monthly fees: December 2026.');
		expect(answer).toContain('Sent INV-7 to accounts@acme.example.');
		const [invoice] = raisedInvoices();
		expect(invoice).toEqual(expect.objectContaining({ status: 'issued', issue_date: '2026-12-01', due_date: '2026-12-31', period_start: '2026-12-01', period_end: '2026-12-31' }));
		expect(heldSchedule().next_invoice_date).toBe('2027-01-01');
		expect(outbox.emails).toHaveLength(1);
		expect(await run('run_billing_schedules', {})).toContain('Nothing was due');
		expect(raisedInvoices()).toHaveLength(1);
		expect(outbox.emails).toHaveLength(1);
	});

	it('leaves a draft when the schedule does not send by itself', async () => {
		await setUpOn('2026-11-13', monthlyFees('2026-12-01', { sendsByItself: false, paymentTermsDays: 14 }));
		expect(await run('run_billing_schedules', {})).toContain('left as a draft to issue by hand');
		expect(raisedInvoices()).toEqual([expect.objectContaining({ status: 'draft', due_date: '2026-12-15' })]);
		expect(await run('run_billing_schedules', {})).toContain('Nothing was due');
		expect(outbox.emails).toEqual([]);
	});

	it('tries a failed sending again on later runs, three times in all, and never raises the invoice again', async () => {
		await setUpOn('2026-11-13', monthlyFees('2026-12-01'));
		outbox.delivery = 'failed';
		expect(await run('run_billing_schedules', {})).toContain('it is tried again on the next run (tries left: 2)');
		expect(await run('run_billing_schedules', {})).toContain('tries left: 1');
		expect(await run('run_billing_schedules', {})).toContain('it is not tried again');
		expect(await run('run_billing_schedules', {})).toContain('INV-7 was tried 3 times and never went');
		expect(sendings()).toHaveLength(3);
		expect(raisedInvoices()).toHaveLength(1);
	});

	it('catches up a schedule three periods behind over three runs, each invoice for its own period', async () => {
		await setUpOn('2026-09-20', monthlyFees('2026-10-01'));
		for (let runNumber = 0; runNumber < 4; runNumber += 1) await run('run_billing_schedules', {});
		const references = raisedInvoices().map((invoice) => invoice.reference);
		expect(references).toEqual(['Monthly fees: October 2026', 'Monthly fees: November 2026', 'Monthly fees: December 2026']);
		expect(raisedInvoices().map((invoice) => invoice.invoice_number)).toEqual([7, 8, 9]);
	});

	it('skips and names a schedule whose customer is archived or has no email, raising nothing', async () => {
		await setUpOn('2026-11-13', monthlyFees('2026-12-01'));
		heldSchedule().customer_id = archivedCustomerId;
		expect(await run('run_billing_schedules', {})).toContain('Nothing was raised from Monthly fees for Gone Ltd: its customer is archived.');
		heldSchedule().customer_id = monthlyFees('').customerId;
		const [acme] = ledgerTables.books_customers;
		acme.email = '';
		expect(await run('run_billing_schedules', {})).toContain('its customer has no email in the books');
		expect(raisedInvoices()).toEqual([]);
	});
});
