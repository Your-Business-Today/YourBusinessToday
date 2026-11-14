import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { SupabaseClient } from '@supabase/supabase-js';
import { ledgerTables } from '$lib/server/mcp/actions/booksLedgerDatabase.fixture';
import { today } from '$lib/server/mcp/actions/booksBillingScheduleWorld.fixture';
import { readOrganisationBilling } from './readOrganisationBilling';
import { changeOrganisationBilling, pauseOrganisationBilling, setUpOrganisationBilling } from './organisationBillingWrites';
import { billingService, clientOrganisation, clientOrganisationId, heldCustomers, holdBooksAndClient, monthlyFees, sevenLines } from './organisationBillingWorld.fixture';

const service = billingService as unknown as SupabaseClient;

const read = async () => (await readOrganisationBilling(service, clientOrganisationId))!;

describe("the Billing tab's writes", () => {
	beforeEach(() => {
		vi.useFakeTimers();
		vi.setSystemTime(today);
		holdBooksAndClient();
	});

	afterEach(() => vi.useRealTimers());

	it('sets up billing with seven lines, making the customer from the organisation’s Details', async () => {
		await setUpOrganisationBilling(service, clientOrganisation, monthlyFees);
		const customer = heldCustomers().find((row) => row.billed_organisation_id === clientOrganisationId);
		expect(customer).toMatchObject({ name: 'Prentice Glass Ltd', contact_name: 'Jo Prentice', email: 'accounts@prentice.example', address: '1 High Street' });
		const [schedule] = (await read()).schedules;
		expect(schedule.lines).toHaveLength(sevenLines.length);
		expect(schedule.summary).toBe('£5,100.00 every month on the 1st, in advance. 14 days to pay. Sends by itself. Next invoice 1 Dec 2026.');
	});

	it('adds a second schedule to the same customer', async () => {
		await setUpOrganisationBilling(service, clientOrganisation, monthlyFees);
		await setUpOrganisationBilling(service, clientOrganisation, { ...monthlyFees, title: 'Yearly licence', frequency: 'yearly', sendsByItself: false });
		const billing = await read();
		expect(billing.schedules.map((schedule) => schedule.title).sort()).toEqual(['Monthly fees', 'Yearly licence']);
		expect(heldCustomers().filter((row) => row.billed_organisation_id === clientOrganisationId)).toHaveLength(1);
	});

	it('refuses a price with three decimal places by name, keeping no schedule', async () => {
		const badLine = { ...sevenLines[0], unitPrice: '1500.005' };
		await expect(setUpOrganisationBilling(service, clientOrganisation, { ...monthlyFees, lines: [badLine] })).rejects.toThrow('Line 1 unitPrice');
		expect(ledgerTables.books_billing_schedules).toEqual([]);
	});

	it('pauses and resumes at once, the line saying so', async () => {
		const scheduleId = await setUpOrganisationBilling(service, clientOrganisation, monthlyFees);
		await pauseOrganisationBilling(service, clientOrganisation, scheduleId, true);
		expect((await read()).schedules[0].summary).toContain('Paused: nothing is raised until it is resumed');
		await pauseOrganisationBilling(service, clientOrganisation, scheduleId, false);
		expect((await read()).schedules[0].summary).toContain('Next invoice 1 Dec 2026.');
	});

	it('saves an edit, leaving out a date the form did not change so a schedule that fell behind keeps it', async () => {
		const scheduleId = await setUpOrganisationBilling(service, clientOrganisation, monthlyFees);
		ledgerTables.books_billing_schedules[0].next_invoice_date = '2026-11-01';
		const edit = { ...monthlyFees, nextInvoiceDate: '2026-11-01', title: 'Monthly service', lines: sevenLines.slice(0, 2), scheduleId };
		await changeOrganisationBilling(service, clientOrganisation, edit);
		const [schedule] = (await read()).schedules;
		expect(schedule.title).toBe('Monthly service');
		expect(schedule.lines).toHaveLength(2);
	});

	it('refuses to change a schedule that bills another customer', async () => {
		const scheduleId = await setUpOrganisationBilling(service, clientOrganisation, monthlyFees);
		ledgerTables.books_billing_schedules[0].customer_id = '00000000-0000-4000-8000-00000000c0a1';
		await expect(pauseOrganisationBilling(service, clientOrganisation, scheduleId, true)).rejects.toThrow('bills Prentice');
	});

});
