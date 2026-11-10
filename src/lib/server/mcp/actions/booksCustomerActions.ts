import { addCustomer, changeCustomer, type CustomerBooks } from '$lib/server/books/customers';
import { findCustomerBalances } from '$lib/server/books/customerBalances';
import { includeArchivedRefusal } from '$lib/data/books/customerRules';
import { refuseWhen } from '$lib/server/books/booksRefusal';
import { moduleAction } from '../organisationModuleGate';
import { objectSchema } from '../actionTypes';
import { answerOrRefusal, booksRefusalOpenings } from './booksAnswer';
import { booksOrganisationField } from './booksFields';
import { clientIdField, customerArchivedField, customerDetailFields, customerIdField, includeArchivedField } from './booksCustomerFields';
import { describeCustomer, describeCustomerBalances } from './describeCustomers';
import type { McpAction } from '../actionTypes';
import type { McpCaller } from '../resolveMcpCaller';
import type { Organisation } from '$lib/server/organisations/organisationRecord';

const oneCustomerPerBusiness =
	'List the customers first with list_customer_balances and add one only when none there is the business the person ' +
	'names; two customers for one business split what it owes. Take every detail from the person and never fill one in.';

const changeOnlyWhatThePersonSaid =
	'Give only what the person asked to change and leave the rest out, so it keeps what the books hold. Archiving keeps ' +
	'every invoice already raised; ask the person before archiving, naming the customer as the books hold it.';

const owedIsWhatTheBooksHold =
	'What a customer owes is read from its issued invoices less what has been paid on them; a draft is not yet owed. ' +
	'Give the person the figures as the books hold them, never an estimate.';

const booksOf = (caller: McpCaller, organisation: Organisation): CustomerBooks => ({
	organisationId: organisation.id,
	place: { isStaff: caller.isStaff, organisationName: organisation.name }
});

export const booksCustomerActions: McpAction[] = [
	moduleAction('books', {
		name: 'list_customer_balances',
		area: 'books',
		audience: 'everyone',
		isWrite: false,
		summary: "list an organisation's customers an invoice can be raised to, with what each still owes and the id of each",
		guidance: owedIsWhatTheBooksHold,
		inputSchema: objectSchema({ organisationId: booksOrganisationField, shouldIncludeArchived: includeArchivedField }, ['organisationId']),
		run: async (caller, input, organisation) =>
			answerOrRefusal(booksRefusalOpenings.reading, async () => {
				refuseWhen(includeArchivedRefusal(input.shouldIncludeArchived));
				const customers = await findCustomerBalances(caller.supabase, organisation.id);
				const shown = input.shouldIncludeArchived === true ? customers : customers.filter(({ customer }) => !customer.isArchived);
				return describeCustomerBalances(organisation.name, shown, customers.length - shown.length);
			})
	}),
	moduleAction('books', {
		name: 'create_customer',
		area: 'books',
		audience: 'everyone',
		isWrite: true,
		summary: "add a customer to an organisation's books: who an invoice is made out to and who it is sent to",
		guidance: oneCustomerPerBusiness,
		inputSchema: objectSchema({ organisationId: booksOrganisationField, ...customerDetailFields, clientId: clientIdField }, ['organisationId', 'name']),
		run: async (caller, input, organisation) =>
			answerOrRefusal(booksRefusalOpenings.saving, async () => {
				const customer = await addCustomer(caller.supabase, booksOf(caller, organisation), input);
				return `Added to ${organisation.name}'s customers:\n${describeCustomer(customer)}`;
			})
	}),
	moduleAction('books', {
		name: 'update_customer',
		area: 'books',
		audience: 'everyone',
		isWrite: true,
		summary: "change one of an organisation's customers: its details, its archiving, or the client on the register it is",
		guidance: changeOnlyWhatThePersonSaid,
		inputSchema: objectSchema(
			{ organisationId: booksOrganisationField, customerId: customerIdField, ...customerDetailFields, isArchived: customerArchivedField, clientId: clientIdField },
			['organisationId', 'customerId']
		),
		run: async (caller, input, organisation) =>
			answerOrRefusal(booksRefusalOpenings.saving, async () => {
				const customer = await changeCustomer(caller.supabase, booksOf(caller, organisation), input);
				return `Saved. ${organisation.name}'s customer now reads:\n${describeCustomer(customer)}`;
			})
	})
];
