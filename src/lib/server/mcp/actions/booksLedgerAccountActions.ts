import { addLedgerAccount, setLedgerAccountArchived } from '$lib/server/books/ledgerAccounts';
import { moduleAction } from '../organisationModuleGate';
import { objectSchema } from '../actionTypes';
import { answerOrRefusal, booksRefusalOpenings } from './booksAnswer';
import { booksOrganisationField } from './booksFields';
import { archiveVerdict, archivingKeepsHistory, isArchivedField, ledgerAccountIdField, newLedgerAccountFields } from './booksChartFields';
import { describeLedgerAccount } from './describeChartOfAccounts';
import type { McpAction } from '../actionTypes';

const addOnlyWhatThePersonGave =
	'Read the chart first with read_chart_of_accounts, and add an account only when none there fits. Take the code, ' +
	'name and type from the person; when they have not said the type or code, ask rather than choose for them.';

export const booksLedgerAccountActions: McpAction[] = [
	moduleAction('books', {
		name: 'create_ledger_account',
		area: 'books',
		audience: 'everyone',
		isWrite: true,
		summary: "add an account to an organisation's chart of accounts, with its code, name and type",
		guidance: addOnlyWhatThePersonGave,
		inputSchema: objectSchema({ organisationId: booksOrganisationField, ...newLedgerAccountFields }, [
			'organisationId',
			'code',
			'name',
			'accountType'
		]),
		run: async (caller, input, organisation) =>
			answerOrRefusal(booksRefusalOpenings.saving, async () => {
				const account = await addLedgerAccount(caller.supabase, organisation.id, input);
				return `Added to ${organisation.name}'s chart of accounts:\n${describeLedgerAccount(account)}`;
			})
	}),
	moduleAction('books', {
		name: 'set_ledger_account_archived',
		area: 'books',
		audience: 'everyone',
		isWrite: true,
		summary: "archive an account in an organisation's chart, or bring it back; a system account is never archived",
		guidance: archivingKeepsHistory,
		inputSchema: objectSchema({ organisationId: booksOrganisationField, accountId: ledgerAccountIdField, isArchived: isArchivedField }, [
			'organisationId',
			'accountId',
			'isArchived'
		]),
		run: async (caller, input, organisation) =>
			answerOrRefusal(booksRefusalOpenings.saving, async () => {
				const account = await setLedgerAccountArchived(caller.supabase, organisation.id, input.accountId, input.isArchived);
				return `${account.code} ${account.name} ${archiveVerdict(account.isArchived)}.`;
			})
	})
];
