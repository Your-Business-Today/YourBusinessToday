import { beforeEach, describe, expect, it, vi } from 'vitest';
import { runOnTheLedger as run } from './booksInvoicePostingWorld.fixture';
import { softwareId } from './booksExpenseWorld.fixture';
import { holdPartnersWhoPayCosts, jamesLedgerId, jamesLoanId, jeremyLoanId } from './booksPartnerPaidCostWorld.fixture';
import { postToLoan } from './booksLoanWorld.fixture';

vi.mock('$lib/server/organisations/getOrganisation', () => ({
	getOrganisation: async (_supabase: unknown, id: string) => ({ id, parentOrganisationId: null, name: 'Your Business Today' })
}));
vi.mock('$lib/server/organisations/getSwitchedOnModules', () => ({ getSwitchedOnModules: async () => ['books'] }));
vi.mock('$lib/data/ukClock', () => ({ ukClockAt: () => ({ date: '2026-11-13', time: '20:00' }) }));

const paidByJames = {
	expenseDate: '2026-11-05',
	supplier: 'Hiscox',
	description: 'Insurance',
	amount: 600,
	expenseAccountId: softwareId,
	isPaid: true,
	paidByLoanAccountId: jamesLoanId
};

const closedRefusal = 'Nothing was posted. The loan account of James Beadle is closed, so no cost can be paid from it';

describe('a loan account closed and opened again', () => {
	beforeEach(holdPartnersWhoPayCosts);

	it('takes no cost a partner paid while closed, and takes one again once opened', async () => {
		expect(await run('update_loan_account', { loanAccountId: jamesLoanId, isClosed: true })).toContain('- James Beadle, director, closed: 2300');
		expect(await run('record_expense', paidByJames)).toContain(closedRefusal);
		expect(await run('update_loan_account', { loanAccountId: jamesLoanId, isClosed: false })).toContain('- James Beadle, director: 2300');
		expect(await run('record_expense', paidByJames)).toContain('paid personally by James Beadle and credited to their loan account');
	});

	it('cannot be closed once the company owes the person, and a closed one with a balance opens again', async () => {
		postToLoan(jamesLedgerId, '2026-11-05', { credit: 600 });
		expect(await run('update_loan_account', { loanAccountId: jamesLoanId, isClosed: true })).toBe(
			'Nothing was changed. The loan account of James Beadle cannot be closed while it holds a balance: at the end of ' +
				'2026-11-13 the company owes James Beadle £600.00. It can be closed once it stands at nil.'
		);
		expect(await run('update_loan_account', { loanAccountId: jeremyLoanId, isClosed: false })).toContain('- Jeremy, director: 2320');
	});
});
