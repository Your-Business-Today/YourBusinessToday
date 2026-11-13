import { importBankLines } from '$lib/server/books/importBankLines';
import { findBankLines } from '$lib/server/books/bankLines';
import { readBankLineReading } from '$lib/server/books/bankLineReading';
import { findStatementAccountIfHeld } from '$lib/server/books/bankStatementAccount';
import { matchBankLine } from '$lib/server/books/matchBankLine';
import { findMatchedJournalDescriptions } from '$lib/server/books/matchedJournals';
import { SystemAccounts } from '$lib/data/books/systemAccounts';
import { bankLineLimits } from '$lib/data/books/bankLineRules';
import { moduleAction } from '../organisationModuleGate';
import { objectSchema } from '../actionTypes';
import { answerOrRefusal, booksRefusalOpenings } from './booksAnswer';
import { booksOrganisationField } from './booksFields';
import { bankLineReadingFields, bankStatementFields } from './booksBankLineFields';
import { bankLineMatchFields } from './booksBankLineMatchFields';
import { describeBankLineImport, describeBankLineList } from './describeBankLines';
import { describeBankLineMatch } from './describeBankLineMatch';
import type { McpAction } from '../actionTypes';

const { bank } = SystemAccounts;

const giveTheLinesAsTheStatementShowsThem =
	"Read the bank's file yourself and give every line exactly as the statement shows it, oldest first: money in above zero, " +
	'money out below, with the balance after each line when the statement gives one. Bringing the same statement in again ' +
	'adds nothing, so a statement that overlaps the last one is safe; ' +
	`a statement longer than ${bankLineLimits.mostLines} lines goes in a month at a time. ` +
	'It keeps the lines only: nothing is posted to the ledger until each line is matched.';

const findTheLineBeforeMatchingIt =
	'Lines come in the order of the statement, each with its id. Use it to see what is still to be matched and to find the line ' +
	'the person means; give them the amounts as the statement has them, never a total you worked out yourself.';

const sayWhatTheLineWas =
	'Give exactly one of invoicePayment, cost, account or existingJournal, as the person says the line was; the amount and day ' +
	'are always the line\'s own. A line already keyed by hand is matched with existingJournal, so nothing is posted twice: ' +
	'find its journal with explain_account_balance on the bank account first.';

export const booksBankLineActions: McpAction[] = [
	moduleAction('books', {
		name: 'import_bank_lines',
		area: 'books',
		audience: 'everyone',
		isWrite: true,
		summary: "bring a bank statement's lines into an organisation's books, each line once however often the statement is given",
		guidance: giveTheLinesAsTheStatementShowsThem,
		inputSchema: objectSchema({ organisationId: booksOrganisationField, ...bankStatementFields }, ['organisationId', 'lines']),
		run: async (caller, input, organisation) =>
			answerOrRefusal(booksRefusalOpenings.saving, async () => {
				const imported = await importBankLines(caller.supabase, organisation.id, input);
				return describeBankLineImport(organisation.name, imported);
			})
	}),
	moduleAction('books', {
		name: 'list_bank_lines',
		area: 'books',
		audience: 'everyone',
		isWrite: false,
		summary: "list the lines of an organisation's bank statement in the books, in the statement's order, matched, unmatched or all",
		guidance: findTheLineBeforeMatchingIt,
		inputSchema: objectSchema({ organisationId: booksOrganisationField, ...bankLineReadingFields }, ['organisationId']),
		run: async (caller, input, organisation) =>
			answerOrRefusal(booksRefusalOpenings.reading, async () => {
				const reading = readBankLineReading(input);
				const account = await findStatementAccountIfHeld(caller.supabase, organisation.id, input.bankAccountCode);
				if (account === null) return `${organisation.name}'s books have no ${bank.name} account yet, so no statement lines.`;
				const lines = await findBankLines(caller.supabase, organisation.id, { bankAccountId: account.id, ...reading });
				const journalDescriptions = await findMatchedJournalDescriptions(caller.supabase, organisation.id, lines);
				return describeBankLineList(organisation.name, account, lines, journalDescriptions);
			})
	}),
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
	})
];
