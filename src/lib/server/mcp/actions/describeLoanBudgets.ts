import type { LoanBudget, LoanBudgetLine, LoanDraw } from '$lib/data/books/loanBudget/loanBudget';
import { totalsOf } from '$lib/data/books/loanBudget/loanBudgetTotals';
import { approvalInWords } from '$lib/data/books/loanBudget/approvalInWords';
import { formatPoundsAndPence } from '$lib/data/books/money';
import { describeMonth } from '$lib/data/books/monthKey';

/** Every loan budget as the connector answers it: the loan, its repayment, its draws and its lines with who approved each. */
export function describeLoanBudgets(organisationName: string, budgets: LoanBudget[]): string {
	if (budgets.length === 0) return `${organisationName}'s books keep no loan budget yet; open_loan_budget keeps one as the directors agreed it.`;
	return [`${organisationName}'s loan budgets:`, ...budgets.map(describeLoanBudget)].join('\n\n');
}

export function describeLoanBudget(budget: LoanBudget): string {
	const totals = totalsOf(budget);
	const repayment = `${formatPoundsAndPence(budget.monthlyRepayment)} a month to ${budget.repaidTo} for ${budget.repaymentMonths} months from ${describeMonth(budget.firstRepaymentMonth)}`;
	return [
		`${budget.title}: ${formatPoundsAndPence(budget.loanAmount)}, repaid ${repayment} (id ${budget.id}).${budget.notes === '' ? '' : ` Notes: ${budget.notes}`}`,
		`Drawn ${formatPoundsAndPence(totals.drawn)}, ${formatPoundsAndPence(totals.undrawn)} still to draw${describeDraws(budget.draws)}.`,
		`Budgeted ${formatPoundsAndPence(totals.budgeted)}, of which ${formatPoundsAndPence(totals.approved)} is approved; ${formatPoundsAndPence(totals.unbudgeted)} is not yet budgeted.`,
		...budget.lines.map(describeBudgetLine)
	].join('\n');
}

/** One line as the connector names it, with whether it may be spent from yet. */
export function describeBudgetLine(line: LoanBudgetLine): string {
	const standing = line.approval === null ? 'awaiting a director’s approval, so nothing may be spent from it yet' : `approved by ${approvalInWords(line.approval)}`;
	return `- ${line.purpose}: ${formatPoundsAndPence(line.amount)}, expected return: ${line.expectedReturn}; ${standing} (id ${line.id}).`;
}

function describeDraws(draws: LoanDraw[]): string {
	if (draws.length === 0) return '';
	return `: ${draws.map((draw) => `${formatPoundsAndPence(draw.amount)} in ${describeMonth(draw.month)}`).join(', ')}`;
}
