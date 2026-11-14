import { ukClockAt } from '$lib/data/ukClock';
import { findLoanAccount, findLoanAccounts } from '$lib/server/books/loanAccounts';
import { openLoanAccount } from '$lib/server/books/openLoanAccount';
import { readLoanBalances, readLoanStatement } from '$lib/server/books/loanStatements';
import { moduleAction } from '../organisationModuleGate';
import { objectSchema } from '../actionTypes';
import { answerOrRefusal, booksRefusalOpenings } from './booksAnswer';
import { booksOrganisationField } from './booksFields';
import { loanAccountIdField, newLoanAccountFields } from './booksLoanAccountFields';
import { describeLoanAccountLine, describeLoanAccounts } from './describeLoanAccounts';
import { describeLoanStatement } from './describeLoanStatement';
import type { McpAction } from '../actionTypes';

const openOnlyWhatThePersonSaid =
	'Take the name and relationship from the person. When their loan is already kept on an account in the chart, give its ' +
	'accountCode, so the statement reads the entries already there; nothing is posted by opening one. To correct the name ' +
	'or relationship later, or to close a settled account, use update_loan_account.';

const overdrawnAtYearEndIsForTheAccountant =
	"Give the figures as the statement holds them. An account still overdrawn at a financial year end is a matter for the company's accountant.";

const todayOnUkClock = (): string => ukClockAt(new Date()).date;

export const booksLoanAccountActions: McpAction[] = [
	moduleAction('books', {
		name: 'open_loan_account',
		area: 'books',
		audience: 'everyone',
		isWrite: true,
		summary: "open a loan account for a director, shareholder or other person in an organisation's books, on a liability account",
		guidance: openOnlyWhatThePersonSaid,
		inputSchema: objectSchema({ organisationId: booksOrganisationField, ...newLoanAccountFields }, ['organisationId', 'personName', 'relationship']),
		run: async (caller, input, organisation) =>
			answerOrRefusal(booksRefusalOpenings.saving, async () => {
				const loan = await openLoanAccount(caller.supabase, organisation.id, input);
				const [{ statement }] = await readLoanBalances(caller.supabase, organisation.id, [loan], todayOnUkClock());
				return `Opened in ${organisation.name}'s books:\n${describeLoanAccountLine(loan, statement.balance)}`;
			})
	}),
	moduleAction('books', {
		name: 'list_loan_accounts',
		area: 'books',
		audience: 'everyone',
		isWrite: false,
		summary: "list the loan accounts in an organisation's books: each person, how they stand to the company and the balance",
		guidance: "Use read_loan_account for one person's entries, when they were overdrawn and their balance at each year end.",
		inputSchema: objectSchema({ organisationId: booksOrganisationField }, ['organisationId']),
		run: async (caller, _input, organisation) =>
			answerOrRefusal(booksRefusalOpenings.reading, async () => {
				const throughDate = todayOnUkClock();
				const loans = await findLoanAccounts(caller.supabase, organisation.id);
				const balances = await readLoanBalances(caller.supabase, organisation.id, loans, throughDate);
				return describeLoanAccounts(organisation.name, balances, throughDate);
			})
	}),
	moduleAction('books', {
		name: 'read_loan_account',
		area: 'books',
		audience: 'everyone',
		isWrite: false,
		summary: "read one person's loan account: every entry in and out, what is owed which way round, when it was overdrawn, and each year end",
		guidance: overdrawnAtYearEndIsForTheAccountant,
		inputSchema: objectSchema(
			{
				organisationId: booksOrganisationField,
				loanAccountId: loanAccountIdField
			},
			['organisationId', 'loanAccountId']
		),
		run: async (caller, input, organisation) =>
			answerOrRefusal(booksRefusalOpenings.reading, async () => {
				const loan = await findLoanAccount(caller.supabase, organisation.id, input.loanAccountId);
				const statement = await readLoanStatement(caller.supabase, organisation.id, loan, todayOnUkClock());
				return describeLoanStatement(organisation.name, loan, statement);
			})
	})
];
