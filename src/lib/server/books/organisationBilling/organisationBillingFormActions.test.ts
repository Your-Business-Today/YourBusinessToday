import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { billingFormFields } from '$lib/data/books/billingScheduleFormField';
import { today } from '$lib/server/mcp/actions/booksBillingScheduleWorld.fixture';
import { ledgerTables } from '$lib/server/mcp/actions/booksLedgerDatabase.fixture';
import { billingService, clientOrganisation, clientOrganisationId, holdBooksAndClient, monthlyFees, sevenLines } from './organisationBillingWorld.fixture';
import { onlyStaffSetBilling, organisationBillingActions } from './organisationBillingFormActions';

const visitor = vi.hoisted(() => ({ isStaff: true }));
vi.mock('$lib/server/auth/requireOrganisationAccess', () => ({
	requireOrganisationAccess: async () => ({ organisation: clientOrganisation, isStaff: visitor.isStaff })
}));
vi.mock('$lib/server/payments/supabaseServiceClient', () => ({ supabaseServiceClient: () => billingService }));

type ActionName = keyof typeof organisationBillingActions;

function post(name: ActionName, fields: Record<string, string>) {
	const body = new FormData();
	for (const [field, value] of Object.entries(fields)) body.set(field, value);
	const request = new Request('https://www.yourbusiness.today/organisations', { method: 'POST', body });
	const event = { locals: {}, params: { organisationId: clientOrganisationId }, request };
	return organisationBillingActions[name](event as never) as Promise<{ status?: number; data?: { message: string }; message?: string }>;
}

const postedSchedule = (fields: Record<string, unknown>) => ({ [billingFormFields.schedule]: JSON.stringify(fields) });

describe("the Billing tab's actions", () => {
	beforeEach(() => {
		vi.useFakeTimers();
		vi.setSystemTime(today);
		visitor.isStaff = true;
		holdBooksAndClient();
	});

	afterEach(() => vi.useRealTimers());

	it('set up billing for staff, and refuse anyone else', async () => {
		expect(await post('setUpBilling', postedSchedule(monthlyFees))).toEqual({ message: 'Billing set up for Prentice.' });
		expect(ledgerTables.books_billing_schedules).toHaveLength(1);
		visitor.isStaff = false;
		await expect(post('setUpBilling', postedSchedule(monthlyFees))).rejects.toMatchObject({ status: 403, body: { message: onlyStaffSetBilling } });
	});

	it('hand a refusal back to the form by name: a price with three decimal places', async () => {
		const lines = [{ ...sevenLines[0], unitPrice: '1500.005' }];
		const answer = await post('setUpBilling', postedSchedule({ ...monthlyFees, lines }));
		expect(answer).toMatchObject({ status: 400, data: { message: expect.stringContaining('Line 1 unitPrice') } });
	});

	it('save an edit, and pause and resume at once', async () => {
		await post('setUpBilling', postedSchedule(monthlyFees));
		const scheduleId = String(ledgerTables.books_billing_schedules[0].id);
		const edit = { ...postedSchedule({ ...monthlyFees, title: 'Monthly service' }), [billingFormFields.scheduleId]: scheduleId };
		expect(await post('changeBilling', edit)).toEqual({ message: 'Billing saved for Prentice.' });
		expect(ledgerTables.books_billing_schedules[0].title).toBe('Monthly service');
		const pause = { [billingFormFields.scheduleId]: scheduleId, [billingFormFields.isPaused]: 'true' };
		expect(await post('pauseBilling', pause)).toEqual({ message: 'Billing paused: nothing is raised until it is resumed.' });
		expect(ledgerTables.books_billing_schedules[0].is_paused).toBe(true);
		expect((await post('pauseBilling', { ...pause, [billingFormFields.isPaused]: 'maybe' })).status).toBe(400);
	});
});
