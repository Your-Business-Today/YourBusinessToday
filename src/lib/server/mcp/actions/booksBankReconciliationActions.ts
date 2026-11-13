import { readBankReconciliation } from '$lib/server/books/bankReconciliation';
import { SystemAccounts } from '$lib/data/books/systemAccounts';
import { moduleAction } from '../organisationModuleGate';
import { objectSchema } from '../actionTypes';
import { answerOrRefusal, booksRefusalOpenings } from './booksAnswer';
import { asAtField, booksOrganisationField } from './booksFields';
import { bankAccountCodeField } from './booksBankLineFields';
import { describeBankReconciliation } from './describeBankReconciliation';
import type { McpAction } from '../actionTypes';

const { bank } = SystemAccounts;

const readItAtTheStatementsLastDay =
	"Take the reading at the statement's last day, as list_bank_lines shows it, and give the person the figures as they come. " +
	'When it is not reconciled, go through the unmatched lines and the entries no line is matched to with them, one at a time.';

export const booksBankReconciliationActions: McpAction[] = [
	moduleAction('books', {
		name: 'read_bank_reconciliation',
		area: 'books',
		audience: 'everyone',
		isWrite: false,
		summary:
			"read whether an organisation's bank agrees with its statement on a day: both balances, the difference, the lines " +
			'not yet matched and the entries in the books no line is matched to',
		guidance: readItAtTheStatementsLastDay,
		inputSchema: objectSchema({ organisationId: booksOrganisationField, bankAccountCode: bankAccountCodeField, asAt: asAtField }, ['organisationId', 'asAt']),
		run: async (caller, input, organisation) =>
			answerOrRefusal(booksRefusalOpenings.reading, async () => {
				const reading = await readBankReconciliation(caller.supabase, organisation.id, input);
				if (reading === null) return `${organisation.name}'s books have no ${bank.name} account yet, so there is nothing to reconcile.`;
				return describeBankReconciliation(organisation.name, reading);
			})
	})
];
