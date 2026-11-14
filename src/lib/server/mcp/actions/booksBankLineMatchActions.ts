import { matchBankLine } from '$lib/server/books/matchBankLine';
import { unmatchBankLine } from '$lib/server/books/unmatchBankLine';
import { moduleAction } from '../organisationModuleGate';
import { objectSchema, textField } from '../actionTypes';
import { answerOrRefusal, booksRefusalOpenings } from './booksAnswer';
import { booksOrganisationField } from './booksFields';
import { bankLineMatchFields } from './booksBankLineMatchFields';
import { describeBankLineMatch, describeBankLineUnmatch } from './describeBankLineMatch';
import type { McpAction } from '../actionTypes';

const sayWhatTheLineWas =
	'Give exactly one of invoicePayment, cost, account or existingJournal, as the person says the line was; the amount and day ' +
	'are always the line\'s own. A line already keyed by hand is matched with existingJournal, so nothing is posted twice: ' +
	'find its journal with explain_account_balance on the bank account first.';

const takeOffOnlyAWrongMatch =
	'Use it when the person says a line was matched to the wrong thing, then match the line again as it really was. A payment is ' +
	'taken back off its invoice and a movement reversed, each on the line\'s day; a cost is deleted with its record kept; an entry ' +
	'that was already in the books stays as it was.';

export const booksBankLineMatchActions: McpAction[] = [
	moduleAction('books', {
		name: 'match_bank_line',
		area: 'books',
		audience: 'everyone',
		isWrite: true,
		summary: "match one line of an organisation's bank statement to what it was: an invoice payment, a cost, another account, or an entry already in the books",
		guidance: sayWhatTheLineWas,
		inputSchema: objectSchema({ organisationId: booksOrganisationField, ...bankLineMatchFields }, ['organisationId', 'bankLineId']),
		run: async (caller, input, organisation) =>
			answerOrRefusal(booksRefusalOpenings.posting, async () => {
				const match = await matchBankLine(caller.supabase, organisation.id, { accountId: caller.accountId }, input);
				return describeBankLineMatch(organisation.name, match);
			})
	}),
	moduleAction('books', {
		name: 'unmatch_bank_line',
		area: 'books',
		audience: 'everyone',
		isWrite: true,
		summary: "take a wrong match off one line of an organisation's bank statement, withdrawing what the match posted, so it can be matched again",
		guidance: takeOffOnlyAWrongMatch,
		inputSchema: objectSchema(
			{ organisationId: booksOrganisationField, bankLineId: textField('The matched statement line, by its id as list_bank_lines gives it') },
			['organisationId', 'bankLineId']
		),
		run: async (caller, input, organisation) =>
			answerOrRefusal(booksRefusalOpenings.changing, async () => {
				const unmatch = await unmatchBankLine(caller.supabase, organisation.id, { accountId: caller.accountId }, input.bankLineId);
				return describeBankLineUnmatch(organisation.name, unmatch);
			})
	})
];
