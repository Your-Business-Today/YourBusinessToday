import { stillHoldsOldName } from '$lib/data/books/loans/oldNameOnChart';
import type { LoanAccountCorrection } from '$lib/server/books/changeLoanAccount';
import { describeLoanAccountLine } from './describeLoanAccounts';

/** A corrected loan account as list_loan_accounts shows it, and whether the chart's account still carries the old name. */
export function describeLoanAccountCorrection(organisationName: string, correction: LoanAccountCorrection, balance: number): string {
	const { before, after } = correction;
	const saved = `Saved in ${organisationName}'s books; nothing was posted:\n${describeLoanAccountLine(after, balance)}`;
	const person = { accountName: after.accountName, oldName: before.personName, newName: after.personName };
	if (!stillHoldsOldName(person)) return saved;
	const chartAccount = `${after.accountCode} "${after.accountName}"`;
	return `${saved}\nThe chart's account ${chartAccount} still holds the old name, ${before.personName}; rename_ledger_account renames it if the person wants it to.`;
}
