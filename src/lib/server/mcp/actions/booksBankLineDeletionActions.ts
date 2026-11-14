import { deleteBankLines } from '$lib/server/books/deleteBankLines';
import { moduleAction } from '../organisationModuleGate';
import { objectSchema } from '../actionTypes';
import { answerOrRefusal, booksRefusalOpenings } from './booksAnswer';
import { booksOrganisationField } from './booksFields';
import { bankLineIdsField } from './booksBankLineFields';
import { describeBankLineDeletion } from './describeBankLineDeletion';
import type { McpAction } from '../actionTypes';

const takeOutOnlyWhatShouldNotBeThere =
	'Use it only for lines the person says should not be there, such as a statement brought in twice or the wrong account: ' +
	'read them back from list_bank_lines first. A matched line has its match taken off with unmatch_bank_line before it can go.';

export const booksBankLineDeletionActions: McpAction[] = [
	moduleAction('books', {
		name: 'delete_bank_lines',
		area: 'books',
		audience: 'everyone',
		isWrite: true,
		summary: "take statement lines brought in by mistake out of an organisation's books; only unmatched lines, and nothing posted changes",
		guidance: takeOutOnlyWhatShouldNotBeThere,
		inputSchema: objectSchema({ organisationId: booksOrganisationField, bankLineIds: bankLineIdsField }, ['organisationId', 'bankLineIds']),
		run: async (caller, input, organisation) =>
			answerOrRefusal(booksRefusalOpenings.deleting, async () => {
				const deletion = await deleteBankLines(caller.supabase, organisation.id, input.bankLineIds);
				return describeBankLineDeletion(organisation.name, deletion);
			})
	})
];
