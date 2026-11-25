import { shiftMonth, type MonthKey } from '../monthKey';
import { CashflowDirections } from '../cashflow/cashflowItem';
import type { ForecastEntry } from '../cashflow/cashflowForecast';
import type { LoanBudget } from './loanBudget';

/** Each loan's draws as money in, in the month drawn, and its repayments as money out every month they run. */
export function forecastEntriesOfLoanBudgets(budgets: LoanBudget[], months: MonthKey[]): ForecastEntry[] {
	return budgets.flatMap((budget) => [...drawEntries(budget), ...repaymentEntries(budget)]).filter((entry) => months.includes(entry.month));
}

/** Every month the loan is repaid in, from its first repayment month. */
export function repaymentMonthsOf(budget: LoanBudget): MonthKey[] {
	return Array.from({ length: budget.repaymentMonths }, (_, offset) => shiftMonth(budget.firstRepaymentMonth, offset));
}

function drawEntries(budget: LoanBudget): ForecastEntry[] {
	const source = `${budget.title}: drawn`;
	return budget.draws.map((draw) => ({ month: draw.month, source, direction: CashflowDirections.moneyIn, amount: draw.amount }));
}

function repaymentEntries(budget: LoanBudget): ForecastEntry[] {
	const source = `${budget.title}: repayment to ${budget.repaidTo}`;
	return repaymentMonthsOf(budget).map((month) => ({ month, source, direction: CashflowDirections.moneyOut, amount: budget.monthlyRepayment }));
}
