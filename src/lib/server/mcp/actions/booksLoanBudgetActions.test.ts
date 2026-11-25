import './booksYourBusinessTodayMocks';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ledgerTables } from './booksLedgerDatabase.fixture';
import { holdThreePartnersLoans, loanOrganisationId } from './booksLoanWorld.fixture';
import { idOf, runOnTheLoans as run } from './booksLoanSteps.fixture';

vi.mock('$lib/data/ukClock', () => ({ ukClockAt: () => ({ date: '2026-11-25', time: '18:00' }) }));

const startUpLoan = {
	title: 'Start Up Loan',
	loanAmount: 20000,
	repaidTo: 'Jeremy Ferendinos',
	monthlyRepayment: 400.76,
	firstRepaymentMonth: '2026-12',
	repaymentMonths: 60
};

const laptops = { purpose: 'Laptops', amount: 3000, expectedReturn: 'Two more builds a month' };

function holdNigelAsADirector(): void {
	holdThreePartnersLoans();
	for (const table of ['books_cashflow_items', 'books_loan_budgets', 'books_loan_draws', 'books_loan_budget_lines', 'books_loan_spends'])
		ledgerTables[table] = [];
	ledgerTables.boardroom_directors = [
		{ id: 'seat', organisation_id: loanOrganisationId, account_id: 'nigel', director_name: 'Nigel Reilly', named_at: '2026-11-01', stood_down_at: null }
	];
}

async function openTheLoan(): Promise<string> {
	return idOf(await run('open_loan_budget', startUpLoan));
}

describe('the ring-fenced loan budget over the connector', () => {
	beforeEach(holdNigelAsADirector);

	it('keeps the loan, and its repayment and draws show on the forecast', async () => {
		const loanBudgetId = await openTheLoan();
		await run('add_loan_draw', { loanBudgetId, month: '2026-12', amount: 10000 });
		const forecast = await run('read_cashflow_forecast', {});
		expect(forecast).toContain('- December 2026: £10,000.00 in, £400.76 out, £9,599.24 at the end.');
		expect(forecast).toContain('- January 2027: £0.00 in, £400.76 out, £9,198.48 at the end.');
	});

	it('adds a line awaiting approval, and refuses lines or draws past the loan', async () => {
		const loanBudgetId = await openTheLoan();
		expect(await run('add_loan_budget_line', { loanBudgetId, ...laptops })).toContain('awaiting a director’s approval');
		const tooMuch = await run('add_loan_budget_line', { loanBudgetId, ...laptops, amount: 17000.01 });
		expect(tooMuch).toBe('Nothing was saved. The lines of Start Up Loan cannot come to more than the loan of £20,000.00; £17,000.00 is left to budget.');
		expect(await run('add_loan_draw', { loanBudgetId, month: '2026-12', amount: 20001 })).toContain('£20,000.00 is left to draw');
	});

	it('lets a sitting director approve a line once, in their name, and a change takes the approval off', async () => {
		const loanBudgetId = await openTheLoan();
		const budgetLineId = idOf(await run('add_loan_budget_line', { loanBudgetId, ...laptops }));
		expect(await run('approve_loan_budget_line', { budgetLineId })).toContain('approved by Nigel Reilly on');
		expect(await run('approve_loan_budget_line', { budgetLineId })).toContain('Nothing was saved. Laptops was already approved by Nigel Reilly');
		const changed = await run('update_loan_budget_line', { budgetLineId, amount: 3500 });
		expect(changed).toContain(
			'It now reads:\n- Laptops: £3,500.00, £0.00 spent, £3,500.00 left, expected return: Two more builds a month; awaiting a director’s approval'
		);
	});

	it('refuses an approval from someone who is not a sitting director', async () => {
		const loanBudgetId = await openTheLoan();
		const budgetLineId = idOf(await run('add_loan_budget_line', { loanBudgetId, ...laptops }));
		ledgerTables.boardroom_directors = [];
		expect(await run('approve_loan_budget_line', { budgetLineId })).toBe(
			'Nothing was saved. Only a sitting director of the organisation approves a budget line, and you are not named as one.'
		);
	});
});
