import { findChartOfAccounts } from '$lib/server/books/chartOfAccounts';
import { readBalanceSheet, readTrialBalance } from '$lib/server/books/booksReports';
import { moduleAction } from '../organisationModuleGate';
import { objectSchema } from '../actionTypes';
import { answerOrRefusal, booksRefusalOpenings } from './booksAnswer';
import { asAtField, booksOrganisationField } from './booksFields';
import { describeChartOfAccounts } from './describeChartOfAccounts';
import { describeTrialBalance } from './describeTrialBalance';
import { describeBalanceSheet } from './describeBalanceSheet';
import type { McpAction } from '../actionTypes';

const figuresAsTheyStand =
	'Give the person the figures as the books hold them: never round, estimate or fill in a figure the ' +
	'reading did not give. To say what makes up a figure, call explain_account_balance for its account.';

export const booksReadActions: McpAction[] = [
	moduleAction('books', {
		name: 'read_chart_of_accounts',
		area: 'books',
		audience: 'everyone',
		isWrite: false,
		summary: "read an organisation's chart of accounts and its cost centres, with the id of each to post to",
		guidance:
			'Read this before posting: every journal line names its account by the id given here. When no account ' +
			'fits what the person describes, ask them which to use rather than choosing one for them; an archived ' +
			'account or cost centre takes no new lines.',
		inputSchema: objectSchema({ organisationId: booksOrganisationField }, ['organisationId']),
		run: async (caller, _input, organisation) => {
			const chart = await findChartOfAccounts(caller.supabase, organisation.id);
			return describeChartOfAccounts(organisation.name, chart);
		}
	}),
	moduleAction('books', {
		name: 'read_trial_balance',
		area: 'books',
		audience: 'everyone',
		isWrite: false,
		summary: "read the trial balance of an organisation's books at the end of a day: every account's balance, debit or credit",
		guidance: figuresAsTheyStand,
		inputSchema: objectSchema({ organisationId: booksOrganisationField, asAt: asAtField }, ['organisationId', 'asAt']),
		run: async (caller, input, organisation) =>
			answerOrRefusal(booksRefusalOpenings.reading, async () => {
				const trialBalance = await readTrialBalance(caller.supabase, organisation.id, input.asAt);
				return describeTrialBalance(organisation.name, trialBalance);
			})
	}),
	moduleAction('books', {
		name: 'read_balance_sheet',
		area: 'books',
		audience: 'everyone',
		isWrite: false,
		summary: "read the balance sheet of an organisation's books at the end of a day: what it owns, owes and is worth",
		guidance: figuresAsTheyStand,
		inputSchema: objectSchema({ organisationId: booksOrganisationField, asAt: asAtField }, ['organisationId', 'asAt']),
		run: async (caller, input, organisation) =>
			answerOrRefusal(booksRefusalOpenings.reading, async () => {
				const sheet = await readBalanceSheet(caller.supabase, organisation.id, input.asAt);
				return describeBalanceSheet(organisation.name, sheet);
			})
	})
];
