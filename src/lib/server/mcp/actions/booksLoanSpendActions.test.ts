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

const oneLaptop = { spentOn: '2026-12-03', amount: 1200, description: 'One laptop' };

const laptopCostId = '00000000-0000-4000-8000-00000000c057';

function holdNigelAsADirector(): void {
	holdThreePartnersLoans();
	for (const table of ['books_cashflow_items', 'books_loan_budgets', 'books_loan_draws', 'books_loan_budget_lines', 'books_loan_spends'])
		ledgerTables[table] = [];
	ledgerTables.boardroom_directors = [
		{ id: 'seat', organisation_id: loanOrganisationId, account_id: 'nigel', director_name: 'Nigel Reilly', named_at: '2026-11-01', stood_down_at: null }
	];
	ledgerTables.books_expenses = [
		{ id: laptopCostId, organisation_id: loanOrganisationId, expense_date: '2026-12-03', supplier: 'Dell', description: 'Laptop', amount: 1200 }
	];
}

async function addTheLaptopsLine(): Promise<string> {
	const loanBudgetId = idOf(await run('open_loan_budget', startUpLoan));
	return idOf(await run('add_loan_budget_line', { loanBudgetId, ...laptops }));
}

describe('spends from the ring-fenced loan over the connector', () => {
	beforeEach(holdNigelAsADirector);

	it('refuses a spend from a line no director has approved', async () => {
		const budgetLineId = await addTheLaptopsLine();
		expect(await run('record_loan_spend', { budgetLineId, ...oneLaptop })).toBe(
			'Nothing was saved. Laptops awaits a director’s approval, so nothing may be spent from it yet.'
		);
	});

	it('records a spend against an approved line with the cost it matches, and the reading shows spent and left', async () => {
		const budgetLineId = await addTheLaptopsLine();
		await run('approve_loan_budget_line', { budgetLineId });
		const recorded = await run('record_loan_spend', { budgetLineId, ...oneLaptop, expenseId: laptopCostId });
		expect(recorded).toContain(`  - 3 Dec 2026: £1,200.00 on One laptop, matching cost ${laptopCostId}`);
		expect(recorded).toContain('£1,800.00 is left on the line.');
		const reading = await run('read_loan_budgets', {});
		expect(reading).toContain('- Laptops: £3,000.00, £1,200.00 spent, £1,800.00 left, expected return');
		expect(reading).toContain('of which £3,000.00 is approved and £1,200.00 spent');
	});

	it('refuses a spend past what is left on the line, a cost the books do not hold, and a line brought below its spends', async () => {
		const budgetLineId = await addTheLaptopsLine();
		await run('approve_loan_budget_line', { budgetLineId });
		await run('record_loan_spend', { budgetLineId, ...oneLaptop });
		expect(await run('record_loan_spend', { budgetLineId, ...oneLaptop, amount: 1800.01 })).toContain('£1,800.00 is left on it');
		const unknownCost = '00000000-0000-4000-8000-0000000000ff';
		expect(await run('record_loan_spend', { budgetLineId, ...oneLaptop, expenseId: unknownCost })).toContain(`No cost ${unknownCost}`);
		expect(await run('update_loan_budget_line', { budgetLineId, amount: 1000 })).toContain('£1,200.00 has already been spent from Laptops');
	});
});
