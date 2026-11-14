import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { blankOrganisationDetails } from '$lib/data/organisationRules';
import { billingSchedulesSource } from '$lib/server/watch/billingSchedulesSource';
import { databaseStepStanding, standDatabaseStepsDown } from './booksLedgerCalls.fixture';
import { holdBooksForTheRun, monthlyFees, raisedInvoices, run, runSupabase, sendings } from './booksBillingRunWorld.fixture';
import type { SupabaseClient } from '@supabase/supabase-js';

vi.mock('$lib/server/email/sendTransactionalEmail', () => ({ sendTransactionalEmail: async () => 'sent' }));
vi.mock('$lib/server/organisations/getOrganisation', () => ({
	getOrganisation: async (_supabase: unknown, id: string) => ({ ...blankOrganisationDetails, id, parentOrganisationId: null, name: 'Your Business Today' })
}));
vi.mock('$lib/server/organisations/getSwitchedOnModules', () => ({ getSwitchedOnModules: async () => ['books'] }));

const knock = () => billingSchedulesSource.run(runSupabase as unknown as SupabaseClient, { resumeMarker: '', wasLastRunFinished: true }, async () => {});

describe('invoices raised from billing schedules', () => {
	beforeEach(async () => {
		vi.useFakeTimers({ toFake: ['Date'] });
		standDatabaseStepsDown();
		holdBooksForTheRun();
		vi.setSystemTime(new Date('2026-11-13T09:00:00Z'));
		await run('create_billing_schedule', monthlyFees('2026-12-01'));
	});
	afterEach(() => vi.useRealTimers());

	it('finishes on the next run an invoice raised but cut off before it was issued', async () => {
		vi.setSystemTime(new Date('2026-12-01T09:00:00Z'));
		databaseStepStanding.refusal = { message: 'the connection closed' };
		expect(await run('run_billing_schedules', {})).toContain('INV-7 was left as it stood');
		expect(raisedInvoices()).toEqual([expect.objectContaining({ status: 'draft' })]);
		standDatabaseStepsDown();
		const answer = await run('run_billing_schedules', {});
		expect(answer).toContain('Issued INV-7. Sent INV-7 to accounts@acme.example.');
		expect(raisedInvoices()).toEqual([expect.objectContaining({ status: 'issued' })]);
		expect(sendings()).toHaveLength(1);
	});

	it('shows the schedule and period on read_invoice, list_invoices and list_billing_schedules', async () => {
		vi.setSystemTime(new Date('2026-12-01T09:00:00Z'));
		await run('run_billing_schedules', {});
		const invoiceId = raisedInvoices()[0].id;
		expect(await run('read_invoice', { invoiceId })).toContain('Raised from billing schedule Monthly fees, for December 2026');
		expect(await run('list_invoices', {})).toContain('; from billing schedule Monthly fees, for December 2026');
		expect(await run('list_billing_schedules', {})).toContain('Invoices raised from it: INV-7 for December 2026, issued.');
	});

	it('says on the books overview what goes out next and how many drafts wait', async () => {
		const overview = await run('read_books_overview', {});
		expect(overview).toContain('Next: Acme Ltd, £5,100.00 on 1 Dec 2026 (Monthly fees, for December 2026, issued and sent by itself).');
		expect(overview).toContain('Drafts waiting to be issued: 0.');
	});

	it('raises nothing before 07:00 UK time, and raises what is due on a knock after it', async () => {
		vi.setSystemTime(new Date('2026-12-01T06:30:00Z'));
		expect((await knock()).note).toContain('before 07:00');
		vi.setSystemTime(new Date('2026-12-01T07:10:00Z'));
		const outcome = await knock();
		expect(outcome.note).toContain('Your Business Today: Invoices raised 1, issued 1, sent 1.');
		expect(outcome.rowsWritten).toBe(3);
		expect(sendings()).toEqual([expect.objectContaining({ sent_by: null })]);
	});
});
