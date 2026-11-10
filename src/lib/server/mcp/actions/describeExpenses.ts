import { formatBritishDate } from '$lib/data/britishDate';
import { formatPoundsAndPence, sumMoney } from '$lib/data/books/money';
import type { Expense } from '$lib/server/books/expenses';
import { nameOf, type ChartNamings } from '$lib/server/books/chartNamings';

/** The costs shown, newest first, each on one line, with how many are still owed and what they come to. */
export function describeExpenseList(organisationName: string, expenses: Expense[], namings: ChartNamings): string {
	if (expenses.length === 0) return `${organisationName}'s books hold no costs that match.`;
	const heading = `Costs of ${organisationName}, newest first. ${describeUnpaid(expenses)}`;
	return [heading, ...expenses.map((expense) => describeExpense(expense, namings))].join('\n');
}

/** One cost on one line: its day, supplier, what it was for, amount, account and cost centre, and whether it is paid. */
export function describeExpense(expense: Expense, namings: ChartNamings): string {
	const forWhat = expense.description === '' ? '' : `, ${expense.description}`;
	const coded = `${nameOf(namings.accountNames, expense.expenseAccountId)}${describeCostCentre(expense, namings)}`;
	const settlement = expense.paidOn === null ? 'unpaid' : `paid ${formatBritishDate(expense.paidOn)}`;
	const cost = `${expense.supplier}${forWhat}, ${formatPoundsAndPence(expense.amount)}`;
	return `- ${formatBritishDate(expense.expenseDate)}: ${cost}; ${coded}; ${settlement}. Id ${expense.id}`;
}

function describeUnpaid(expenses: Expense[]): string {
	const unpaid = expenses.filter((expense) => expense.paidOn === null);
	const owed = sumMoney(unpaid.map((expense) => expense.amount));
	return `${expenses.length} shown, ${unpaid.length} unpaid, owing ${formatPoundsAndPence(owed)}.`;
}

function describeCostCentre(expense: Expense, namings: ChartNamings): string {
	if (expense.costCentreId === null) return '';
	return `, cost centre ${nameOf(namings.costCentreNames, expense.costCentreId)}`;
}
