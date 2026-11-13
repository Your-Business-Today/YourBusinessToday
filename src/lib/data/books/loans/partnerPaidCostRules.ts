/** A loan account as a cost paid from it needs it: whose it is, and whether it is still open. */
export type PayingLoanAccount = { personName: string; isClosed: boolean };

const owedCost =
	'paidByLoanAccountId is for a cost a person has paid already from their own pocket, so it comes with isPaid true; ' +
	'a cost still owed to the supplier has nobody who paid it yet.';

/** Why a cost recorded as still owed cannot name the loan account that paid it, or null when it was paid already. */
export function owedCostRefusal(isPaid: unknown): string | null {
	const isLeftAsOwed = isPaid === undefined || isPaid === false;
	return isLeftAsOwed ? owedCost : null;
}

/** Why the loan account cannot be credited with a cost its person paid, or null when it is open. */
export function closedLoanAccountRefusal(loan: PayingLoanAccount): string | null {
	if (!loan.isClosed) return null;
	return `The loan account of ${loan.personName} is closed, so no cost can be paid from it; list_loan_accounts lists those still open.`;
}
