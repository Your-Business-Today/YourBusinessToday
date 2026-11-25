import { fromPence, formatPoundsAndPence } from '$lib/data/books/money';
import { describeMonth } from '$lib/data/books/monthKey';
import type { DirectorsLoanPart } from '$lib/data/books/sharing/directorsLoanParts';
import { postDirectorsLoanParts, type DirectorsLoanPosting } from '$lib/server/books/postDirectorsLoanParts';
import { ukClockAt } from '$lib/data/ukClock';
import { moduleAction } from '../organisationModuleGate';
import { objectSchema, textField } from '../actionTypes';
import { answerOrRefusal, booksRefusalOpenings } from './booksAnswer';
import { booksOrganisationField } from './booksFields';
import { costCentreIdField } from './booksChartFields';
import type { McpAction } from '../actionTypes';

const loanGuidance =
	"Run once a month for each shared cost with a member kept on a director's loan, after the month's bills are in the books, or for each past month in turn. " +
	"Each such member's part of the month is moved off the costs onto its loan account by one journal, described by the shared cost and the month and never by whose the part is. " +
	'A month is moved once and never into a month the books are closed to; read_cost_shares shows which months have moved.';

const todayOnUkClock = (): string => ukClockAt(new Date()).date;

export const booksCostShareLoanActions: McpAction[] = [
	moduleAction('books', {
		name: 'post_cost_share_directors_loan',
		area: 'books',
		audience: 'everyone',
		isWrite: true,
		summary: "move a month's parts of a shared cost that members keep on a director's loan off the costs onto that loan, one journal each",
		guidance: loanGuidance,
		inputSchema: objectSchema(
			{ organisationId: booksOrganisationField, costCentreId: costCentreIdField, month: textField('The month to move, written as 2026-07') },
			['organisationId', 'costCentreId', 'month']
		),
		run: async (caller, input, organisation) =>
			answerOrRefusal(booksRefusalOpenings.saving, async () => {
				const request = { costCentreId: input.costCentreId, month: input.month };
				const posting = await postDirectorsLoanParts(caller.supabase, organisation.id, todayOnUkClock(), request);
				return describePosting(posting);
			})
	})
];

function describePosting(posting: DirectorsLoanPosting): string {
	const month = describeMonth(posting.month);
	const posted = posting.posted.map((part) => `- ${partText(part)} moved onto the director's loan, dated ${posting.journalDate}`);
	const already = posting.alreadyPosted.map((part) => `- ${partText(part)}: ${month} was already moved, so nothing was posted`);
	const empty = posting.empty.map((part) => `- member ${part.member.id} took nothing of the cost in ${month}, so nothing was posted`);
	return [`${month}, parts kept on a director's loan:`, ...posted, ...already, ...empty].join('\n');
}

function partText(part: DirectorsLoanPart): string {
	return `member ${part.member.id}'s ${formatPoundsAndPence(fromPence(part.pence))}`;
}
