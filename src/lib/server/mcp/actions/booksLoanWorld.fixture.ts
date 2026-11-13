import { clearLedgerTables, ledgerTables } from './booksLedgerDatabase.fixture';

type Row = Record<string, unknown>;

export const loanOrganisationId = '00000000-0000-4000-8000-0000000000a1';
export const jamesLoanId = '00000000-0000-4000-8000-000000002300';
export const nigelLoanId = '00000000-0000-4000-8000-000000002310';
export const jeremyLoanId = '00000000-0000-4000-8000-000000002320';
export const bankId = '00000000-0000-4000-8000-000000001200';
export const salesId = '00000000-0000-4000-8000-000000004000';

export const liability = (id: string, code: string, name: string): Row => ({
	id,
	code,
	name,
	account_type: 'liability',
	is_system: false,
	is_archived: false
});

let journalCount = 0;

/** One journal on a loan account: a credit is money the person put in, a debit money they took out. */
function postToLoan(accountId: string, journalDate: string, movement: { debit?: number; credit?: number }): void {
	journalCount += 1;
	const journalId = `00000000-0000-4000-8000-0000000f${String(journalCount).padStart(4, '0')}`;
	const journal = {
		journal_date: journalDate,
		description: `Journal ${journalCount}`,
		kind: 'manual'
	};
	const loanLine = {
		id: `${journalId}-l`,
		organisation_id: loanOrganisationId,
		journal_id: journalId,
		account_id: accountId,
		cost_centre_id: null,
		debit: movement.debit ?? 0,
		credit: movement.credit ?? 0,
		position: 1,
		books_journals: journal
	};
	ledgerTables.books_journal_lines.push(loanLine);
}

/** Three partners' liability accounts already holding journals, no loan accounts yet, a bank and a sales account. */
export function holdThreePartnersLoans(): void {
	clearLedgerTables();
	journalCount = 0;
	holdPartnersChart();
	ledgerTables.books_journal_lines = [];
	postToLoan(jamesLoanId, '2026-08-01', { credit: 500 });
	postToLoan(jamesLoanId, '2026-08-20', { debit: 619.25 });
	postToLoan(jamesLoanId, '2026-09-02', { credit: 200 });
	postToLoan(jamesLoanId, '2026-10-05', { debit: 150 });
	postToLoan(nigelLoanId, '2026-09-10', { credit: 550 });
	postToLoan(jeremyLoanId, '2026-09-11', { credit: 550 });
}

function holdPartnersChart(): void {
	ledgerTables.books_ledger_accounts = [
		{ id: bankId, code: '1200', name: 'Bank', account_type: 'asset', is_system: true, is_archived: false },
		liability(jamesLoanId, '2300', 'James Beadle loan'),
		liability(nigelLoanId, '2310', 'Nigel loan'),
		liability(jeremyLoanId, '2320', 'Jeremy loan'),
		{ id: salesId, code: '4000', name: 'Sales', account_type: 'income', is_system: true, is_archived: false }
	];
	ledgerTables.books_cost_centres = [];
	ledgerTables.books_settings = [{ organisation_id: loanOrganisationId, financial_year_start_month: 8 }];
	ledgerTables.books_loan_accounts = [];
}
