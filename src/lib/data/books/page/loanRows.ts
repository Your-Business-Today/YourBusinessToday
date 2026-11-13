import { formatPoundsAndPence, sumMoney } from '../money';
import type { LoanRelationship } from '../loans/loanAccountRules';
import type { LoanStatement } from '../loans/loanStatement';

/**
 * A loan account as the Loans page lists it: the person, how they stand to the company, the balance and who owes whom in
 * words, the day it last moved, and its statement, so a row opens with no page load.
 */
export type LoanRow = {
	id: string;
	personName: string;
	relationship: LoanRelationship;
	balance: number;
	owedInWords: string;
	lastMovement: string | null;
	isClosed: boolean;
	statement: LoanStatement;
};

export const relationshipLabels: Record<LoanRelationship, string> = { director: 'Director', shareholder: 'Shareholder', other: 'Other' };

const nothing = 0;
const one = 1;

/** What the loan accounts come to, in the Loans page's one line: how many, what the company owes on them and what it is owed. */
export function describeLoansStanding(rows: LoanRow[]): string {
	if (rows.length === nothing) {
		return 'No loan accounts are kept yet. Your Claude opens one for a director or shareholder through the Your Business Today connector.';
	}
	const accounts = rows.length === one ? 'One loan account' : `${rows.length} loan accounts`;
	const owedByTheCompany = sumMoney(rows.filter((row) => row.balance > nothing).map((row) => row.balance));
	const owedToTheCompany = sumMoney(rows.filter((row) => row.balance < nothing).map((row) => -row.balance));
	const owedSentence = `the company owes ${formatPoundsAndPence(owedByTheCompany)} on them and is owed ${formatPoundsAndPence(owedToTheCompany)}`;
	return `${accounts}: ${owedSentence}.`;
}
