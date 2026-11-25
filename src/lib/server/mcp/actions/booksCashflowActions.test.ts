import './booksYourBusinessTodayMocks';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ledgerTables } from './booksLedgerDatabase.fixture';
import { bankId, holdThreePartnersLoans, loanOrganisationId } from './booksLoanWorld.fixture';
import { idOf, runOnTheLoans as run } from './booksLoanSteps.fixture';

vi.mock('$lib/data/ukClock', () => ({
	ukClockAt: () => ({ date: '2026-11-25', time: '18:00' })
}));

const repayment = { title: 'Repayment to Jeremy', direction: 'out', amount: 400.76, repeats: 'monthly', firstMonth: '2026-12' };

function holdCashAndASchedule(): void {
	holdThreePartnersLoans();
	ledgerTables.books_cashflow_items = [];
	ledgerTables.books_journal_lines.push({
		id: 'bank-side',
		organisation_id: loanOrganisationId,
		journal_id: 'opening',
		account_id: bankId,
		debit: 2000,
		credit: 0,
		description: '',
		books_journals: { journal_date: '2026-11-01', description: 'Money in' }
	});
	ledgerTables.books_customers = [{ id: 'pfp', name: 'Jewel PFP', contact_name: '', email: '', address: '', is_archived: false }];
	ledgerTables.books_billing_schedules = [
		{ id: 'fees', customer_id: 'pfp', title: 'Portal fees', frequency: 'monthly', next_invoice_date: '2026-12-01', covers: 'in_advance' },
		{ id: 'paused', customer_id: 'pfp', title: 'Website', frequency: 'monthly', next_invoice_date: '2026-12-01', covers: 'in_advance', is_paused: true }
	].map((schedule) => ({ payment_terms_days: 0, sends_by_itself: true, notes: '', is_paused: false, ends_on: null, ...schedule }));
	ledgerTables.books_billing_schedule_lines = [
		{ id: 'line', schedule_id: 'fees', description: 'Portal', quantity: 1, unit_price: 1500, income_account_id: 'sales', cost_centre_id: null }
	];
}

describe('the cashflow forecast over the connector', () => {
	beforeEach(holdCashAndASchedule);

	it('adds an item as the directors gave it, and reads it into twelve months from the cash at bank', async () => {
		const added = await run('add_cashflow_item', repayment);
		expect(added).toContain('- Repayment to Jeremy: £400.76 out, monthly from December 2026');
		const forecast = await run('read_cashflow_forecast', {});
		expect(forecast).toContain('from £2,000.00 at bank at the end of 2026-11-25');
		expect(forecast).toContain('- November 2026: £0.00 in, £0.00 out, £2,000.00 at the end.');
		expect(forecast).toContain('- December 2026: £1,500.00 in, £400.76 out, £3,099.24 at the end.');
		expect(forecast).toContain('The cash lasts the twelve months.');
	});

	it('refuses an item its columns cannot hold, saving nothing', async () => {
		expect(await run('add_cashflow_item', { ...repayment, amount: -5 })).toBe('Nothing was saved. amount cannot be below zero; -5 was given.');
		expect(ledgerTables.books_cashflow_items).toEqual([]);
	});

	it('ends a repeating item at its last month, and refuses a last month before its first', async () => {
		const cashflowItemId = idOf(await run('add_cashflow_item', repayment));
		const ended = await run('update_cashflow_item', { cashflowItemId, lastMonth: '2027-01' });
		expect(ended).toContain('It now reads:\n- Repayment to Jeremy: £400.76 out, monthly from December 2026 to January 2027');
		expect(await run('update_cashflow_item', { cashflowItemId, lastMonth: '2026-10' })).toContain('Nothing was changed. lastMonth cannot come before');
	});
});
