import { formatPoundsAndPence } from '$lib/data/books/money';
import { whatIsOwed } from '$lib/data/books/loans/whatIsOwed';
import type { LoanStatement } from '$lib/data/books/loans/loanStatement';
import type { LoanAccount } from '$lib/server/books/loanAccounts';

/** One loan account as a list shows it: the person, how they stand, the account and its balance. */
export function describeLoanAccountLine(loan: LoanAccount, balance: number): string {
	const closed = loan.isClosed ? ', closed' : '';
	const owed = whatIsOwed(loan.personName, balance);
	return `- ${loan.personName}, ${loan.relationship}${closed}: ${loan.accountCode} ${loan.accountName}, balance ${formatPoundsAndPence(balance)}, so ${owed} (id ${loan.id})`;
}

export function describeLoanAccounts(
	organisationName: string,
	balances: { loan: LoanAccount; statement: LoanStatement }[],
	throughDate: string
): string {
	if (balances.length === 0) return `${organisationName}'s books hold no loan accounts yet; open_loan_account opens one for a person.`;
	return [
		`Loan accounts in ${organisationName}'s books, balances at the end of ${throughDate}:`,
		...balances.map(({ loan, statement }) => describeLoanAccountLine(loan, statement.balance))
	].join('\n');
}
