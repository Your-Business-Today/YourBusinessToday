import type { LoanBudget } from '../loanBudget/loanBudget';
import { totalsOf } from '../loanBudget/loanBudgetTotals';
import { approvalInWords } from '../loanBudget/approvalInWords';
import { spendingOf } from '../loanBudget/loanLineSpending';
import { formatPoundsAndPence } from '../money';
import { describeMonth } from '../monthKey';

/** A budget line as the Cashflow tab lists it: what it is for, its budget, spent and left, its return and who approved it. */
export type BudgetLineRow = { id: string; purpose: string; amount: number; spent: number; left: number; expectedReturn: string; approval: string };

/** A loan budget as the Cashflow tab shows it: its title, where it stands in one line, and its lines. */
export type LoanBudgetPanel = { id: string; title: string; standing: string; lineCount: number; lines: BudgetLineRow[] };

const awaitingApproval = 'Awaiting a director';

export function loanBudgetPanelsOf(budgets: LoanBudget[]): LoanBudgetPanel[] {
	return budgets.map(panelOf);
}

function panelOf(budget: LoanBudget): LoanBudgetPanel {
	const lines = lineRowsOf(budget);
	return { id: budget.id, title: budget.title, standing: describeBudgetStanding(budget), lineCount: lines.length, lines };
}

/** The loan, its repayment and how much of it is drawn, budgeted and approved, in one line. */
export function describeBudgetStanding(budget: LoanBudget): string {
	const totals = totalsOf(budget);
	const repayment = `${formatPoundsAndPence(budget.monthlyRepayment)} a month to ${budget.repaidTo} from ${describeMonth(budget.firstRepaymentMonth)}`;
	const [drawn, budgeted, approved, spent] = [totals.drawn, totals.budgeted, totals.approved, totals.spent].map(formatPoundsAndPence);
	const use = `${drawn} drawn, ${budgeted} budgeted, ${approved} approved, ${spent} spent`;
	return `${formatPoundsAndPence(budget.loanAmount)}, repaid ${repayment}; ${use}.`;
}

function lineRowsOf(budget: LoanBudget): BudgetLineRow[] {
	return budget.lines.map((line) => ({
		id: line.id,
		purpose: line.purpose,
		amount: line.amount,
		...spendingOf(line),
		expectedReturn: line.expectedReturn,
		approval: line.approval === null ? awaitingApproval : approvalInWords(line.approval)
	}));
}
