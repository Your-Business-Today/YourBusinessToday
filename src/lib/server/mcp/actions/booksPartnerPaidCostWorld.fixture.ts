import { ledgerTables } from './booksLedgerDatabase.fixture';
import { holdChartForCosts } from './booksExpenseWorld.fixture';
import { organisationId } from './booksInvoicePostingWorld.fixture';
import { liability } from './booksLoanWorld.fixture';

export const jamesLedgerId = '00000000-0000-4000-8000-000000002300';
export const jeremyLedgerId = '00000000-0000-4000-8000-000000002320';
export const jamesLoanId = '00000000-0000-4000-8000-000000102300';
export const jeremyLoanId = '00000000-0000-4000-8000-000000102320';
export const otherBooksLoanId = '00000000-0000-4000-8000-000000102399';

const otherOrganisationId = '00000000-0000-4000-8000-0000000000b2';

const loanAccount = (id: string, ledgerAccountId: string, personName: string, isClosed: boolean) => ({
	id,
	organisation_id: organisationId,
	ledger_account_id: ledgerAccountId,
	person_name: personName,
	relationship: 'director',
	is_closed: isClosed
});

/** The chart for costs with James's open loan account, Jeremy's closed one, and a loan account of another organisation's books. */
export function holdPartnersWhoPayCosts(): void {
	holdChartForCosts();
	ledgerTables.books_ledger_accounts.push(liability(jamesLedgerId, '2300', 'James Beadle loan'), liability(jeremyLedgerId, '2320', 'Jeremy loan'));
	ledgerTables.books_loan_accounts = [
		loanAccount(jamesLoanId, jamesLedgerId, 'James Beadle', false),
		loanAccount(jeremyLoanId, jeremyLedgerId, 'Jeremy', true),
		{ ...loanAccount(otherBooksLoanId, jamesLedgerId, 'Someone else', false), organisation_id: otherOrganisationId }
	];
}
