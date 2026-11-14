import './booksYourBusinessTodayMocks';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ledgerTables } from './booksLedgerDatabase.fixture';
import { holdThreePartnersLoans, jamesLoanId } from './booksLoanWorld.fixture';
import { runOnTheLoans as run } from './booksLoanSteps.fixture';

vi.mock('$lib/data/ukClock', () => ({
	ukClockAt: () => ({ date: '2026-11-13', time: '20:00' })
}));

describe('opening a loan account', () => {
	beforeEach(holdThreePartnersLoans);
	it('add a liability account at the next free code when the person names none', async () => {
		const opened = await run('open_loan_account', {
			personName: 'Sam Smith',
			relationship: 'other'
		});
		expect(opened).toContain('- Sam Smith, other: 2330 Loan account: Sam Smith, balance £0.00, so nothing is owed either way');
	});

	it('refuse by name an account that is not a liability, or one that already belongs to a person', async () => {
		expect(
			await run('open_loan_account', {
				personName: 'Sam',
				relationship: 'director',
				accountCode: '1200'
			})
		).toBe('Nothing was saved. 1200 Bank is an asset account; a loan account is kept on a liability account.');
		await run('open_loan_account', {
			personName: 'James Beadle',
			relationship: 'director',
			accountCode: '2300'
		});
		expect(
			await run('open_loan_account', {
				personName: 'Sam',
				relationship: 'director',
				accountCode: '2300'
			})
		).toBe("Nothing was saved. 2300 James Beadle loan is already James Beadle's loan account; one account belongs to one person.");
		expect(ledgerTables.books_loan_accounts.map((loan) => loan.ledger_account_id)).toEqual([jamesLoanId]);
	});

	it('refuse a code the chart does not hold and a loan account nobody opened', async () => {
		expect(
			await run('open_loan_account', {
				personName: 'Sam',
				relationship: 'director',
				accountCode: '2399'
			})
		).toBe('Nothing was saved. No account with the code "2399" is in this organisation\'s chart of accounts.');
		expect(await run('read_loan_account', { loanAccountId: jamesLoanId })).toBe(
			`No reading was taken. No loan account ${jamesLoanId} is in this organisation's books; list_loan_accounts lists them.`
		);
	});
});
