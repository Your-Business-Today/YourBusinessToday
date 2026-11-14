import { ledgerDatabase, ledgerTables } from './booksLedgerDatabase.fixture';
import { booksActions } from './booksActions';
import { liability, loanOrganisationId as organisationId } from './booksLoanWorld.fixture';
import type { McpAction } from '../actionTypes';
import type { McpCaller } from '../resolveMcpCaller';

type Row = Record<string, unknown>;

/** The database step that adds a liability account and the loan account over it, all or nothing. */
function openLoanAccountStep(args: Row): { data: unknown; error: unknown } {
	const isCodeTaken = ledgerTables.books_ledger_accounts.some((account) => account.code === args.new_account_code);
	if (isCodeTaken) return { data: null, error: { code: '23505' } };
	const accountId = `00000000-0000-4000-8000-00000000${String(args.new_account_code).padStart(4, '0')}`;
	ledgerTables.books_ledger_accounts.push(liability(accountId, String(args.new_account_code), String(args.new_account_name)));
	const loanId = `00000000-0000-4000-8000-0000001${String(args.new_account_code).padStart(5, '0')}`;
	const loan = {
		id: loanId,
		organisation_id: args.target_organisation_id,
		ledger_account_id: accountId,
		person_name: args.target_person_name,
		relationship: args.target_relationship,
		is_closed: false
	};
	ledgerTables.books_loan_accounts.push(loan);
	return { data: loanId, error: null };
}

export const loanDatabase = {
	from: ledgerDatabase.from,
	rpc: async (name: string, args: Row) =>
		name === 'open_books_loan_account' ? openLoanAccountStep(args) : { data: null, error: { message: `no step ${name}` } }
};

const nigel = {
	accountId: 'nigel',
	isStaff: false,
	supabase: loanDatabase,
	organisationMemberships: [{ organisationId, accountId: 'nigel', isManager: false }]
} as unknown as McpCaller;

/** Runs a books action as Nigel on the loan world's organisation, against the stand-in that opens loan accounts. */
export const runOnTheLoans = (name: string, input: Record<string, unknown>) =>
	(booksActions.find((action) => action.name === name) as McpAction).run(nigel, { organisationId, ...input }) as Promise<string>;

/** The id an answer names in brackets, such as the loan account it opened. */
export const idOf = (answer: string): string => (answer.match(/\(id ([0-9a-f-]+)\)/) as RegExpMatchArray)[1];
