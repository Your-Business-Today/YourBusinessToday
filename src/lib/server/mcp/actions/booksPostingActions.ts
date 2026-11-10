import { postJournal } from '$lib/server/books/postJournal';
import { formatPoundsAndPence, sumMoney } from '$lib/data/books/money';
import { manualJournalKind } from '$lib/data/books/journalKinds';
import { moduleAction } from '../organisationModuleGate';
import { objectSchema } from '../actionTypes';
import { answerOrRefusal, booksRefusalOpenings } from './booksAnswer';
import { booksOrganisationField, journalFields } from './booksFields';
import type { McpAction } from '../actionTypes';

const postWhatThePersonSaid =
	'Post only what the person told you: the day, what it is for, each account and each amount. Never guess an ' +
	'account, an amount, a date or a side; ask them instead. Read the chart of accounts first for the ids, and ' +
	'say the journal back to the person before posting it. A journal is never edited or deleted: one posted in ' +
	'error is undone by posting its reversal, the same lines on the other sides, with reversesJournalId naming ' +
	'it. Invoices, payments, supplier costs and month-end entries post through their own actions once they exist, ' +
	'never as a journal here.';

export const booksPostingActions: McpAction[] = [
	moduleAction('books', {
		name: 'post_journal',
		area: 'books',
		audience: 'everyone',
		isWrite: true,
		summary: "post a journal to an organisation's books by double entry: dated lines whose debits equal their credits",
		guidance: postWhatThePersonSaid,
		inputSchema: objectSchema({ organisationId: booksOrganisationField, ...journalFields }, [
			'organisationId',
			'journalDate',
			'description',
			'lines'
		]),
		run: async (caller, input, organisation) =>
			answerOrRefusal(booksRefusalOpenings.posting, async () => {
				const journal = { ...input, kind: manualJournalKind };
				const journalId = await postJournal(caller.supabase, organisation.id, journal);
				return postedSentence(organisation.name, input, journalId);
			})
	})
];

function postedSentence(organisationName: string, input: Record<string, unknown>, journalId: string): string {
	const lines = input.lines as { debit?: number }[];
	const totalDebit = sumMoney(lines.map((line) => Number(line.debit ?? 0)));
	return (
		`Posted journal ${journalId} to ${organisationName}'s books, dated ${input.journalDate}: ${input.description}. ` +
		`${lines.length} lines, ${formatPoundsAndPence(totalDebit)} on each side.`
	);
}
