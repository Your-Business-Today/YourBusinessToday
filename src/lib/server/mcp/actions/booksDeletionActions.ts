import { findBooksDeletion, findBooksDeletions } from '$lib/server/books/booksDeletionReading';
import { getAccountsById } from '$lib/server/accounts/getAccountsById';
import { accountNameLookup } from '$lib/data/accountNames';
import { moduleAction } from '../organisationModuleGate';
import { objectSchema } from '../actionTypes';
import { answerOrRefusal, booksRefusalOpenings } from './booksAnswer';
import { booksDeletionIdField, booksOrganisationField } from './booksFields';
import { describeDeletionInFull, describeDeletionList } from './describeBooksDeletions';
import type { McpAction } from '../actionTypes';

const whatWentAndWho =
	'Every invoice and cost deleted from the books leaves a record: what it was, who deleted it and when. The newest comes ' +
	'first. Use it to answer what happened to an invoice or a cost the person cannot find; read_books_deletion gives the copy.';

const putBackOnlyWhenAsked =
	'The copy is the row as the books held it, with its lines and, for a cost, the journals it posted. To put one back that ' +
	'was deleted by mistake, and only when the person asks, make it again from the copy with create_invoice or record_expense; ' +
	'it takes a new id, and an invoice the next number. The record itself is never changed or deleted.';

export const booksDeletionActions: McpAction[] = [
	moduleAction('books', {
		name: 'list_books_deletions',
		area: 'books',
		audience: 'everyone',
		isWrite: false,
		summary: "list the invoices and costs deleted from an organisation's books, newest first, with who deleted each and when",
		guidance: whatWentAndWho,
		inputSchema: objectSchema({ organisationId: booksOrganisationField }, ['organisationId']),
		run: async (caller, _input, organisation) =>
			answerOrRefusal(booksRefusalOpenings.reading, async () => {
				const deletions = await findBooksDeletions(caller.supabase, organisation.id);
				const people = await getAccountsById(caller.supabase, deletions.map((deletion) => deletion.deletedByAccountId));
				return describeDeletionList(organisation.name, deletions, accountNameLookup(people));
			})
	}),
	moduleAction('books', {
		name: 'read_books_deletion',
		area: 'books',
		audience: 'everyone',
		isWrite: false,
		summary: "read one deletion from an organisation's books in full: what went, who deleted it, when, and the copy kept of it",
		guidance: putBackOnlyWhenAsked,
		inputSchema: objectSchema({ organisationId: booksOrganisationField, deletionId: booksDeletionIdField }, ['organisationId', 'deletionId']),
		run: async (caller, input, organisation) =>
			answerOrRefusal(booksRefusalOpenings.reading, async () => {
				const deletion = await findBooksDeletion(caller.supabase, organisation.id, input.deletionId);
				const people = await getAccountsById(caller.supabase, [deletion.deletedByAccountId]);
				return describeDeletionInFull(deletion, accountNameLookup(people));
			})
	})
];
