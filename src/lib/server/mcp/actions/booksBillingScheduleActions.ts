import { validateRecordId } from '$lib/data/isUuid';
import { refuseWhen } from '$lib/server/books/booksRefusal';
import { createBillingSchedule } from '$lib/server/books/createBillingSchedule';
import { changeBillingSchedule } from '$lib/server/books/changeBillingSchedule';
import { moduleAction } from '../organisationModuleGate';
import { objectSchema } from '../actionTypes';
import { answerOrRefusal, booksRefusalOpenings } from './booksAnswer';
import { booksOrganisationField } from './booksFields';
import { billingScheduleChangeFields, billingScheduleFilterFields, neededForANewSchedule, newBillingScheduleFields } from './booksBillingScheduleFields';
import { readBillingSchedule, readBillingSchedules } from './booksBillingScheduleReading';
import type { McpAction } from '../actionTypes';

const setUpOnlyWhatThePersonAgreed =
	'Set up only what the person agreed with the customer: the lines, prices, how often, the first invoice date and ' +
	'whether each invoice covers the period ahead or the one just gone. Ask whether invoices send by itself and never ' +
	'assume it. A first date before today is refused: bring an earlier period in with create_invoice. Read the answer ' +
	'back. From 07:00 UK time on its date, the hourly run raises its invoice, and issues and emails it when it sends by itself.';

const changeOnlyWhatThePersonAsked =
	'Give only what the person asked to change. To pause give isPaused true, to resume false; to end it give endsOn, the ' +
	'last day an invoice may be raised. lines takes the place of every line: list_billing_schedules first, then send every ' +
	'line that is to stay as it reads there. A change reaches only invoices not yet raised. Read the answer back.';

const readAsTheBooksHoldIt =
	'Give the person each schedule as the books hold it: what it bills, how often, its next invoice with its total and ' +
	'period, whether it sends by itself, and its lines. Never work a figure out yourself.';

export const booksBillingScheduleActions: McpAction[] = [
	moduleAction('books', {
		name: 'create_billing_schedule',
		area: 'books',
		audience: 'everyone',
		isWrite: true,
		summary: "set what one of an organisation's customers is billed again and again: the lines, how much, how often and from when",
		guidance: setUpOnlyWhatThePersonAgreed,
		inputSchema: objectSchema({ organisationId: booksOrganisationField, ...newBillingScheduleFields }, ['organisationId', ...neededForANewSchedule]),
		run: async (caller, input, organisation) =>
			answerOrRefusal(booksRefusalOpenings.saving, async () => {
				const scheduleId = await createBillingSchedule(caller.supabase, organisation.id, input);
				const schedule = await readBillingSchedule(caller.supabase, organisation.id, scheduleId);
				return `Set up in ${organisation.name}'s books.\n${schedule}`;
			})
	}),
	moduleAction('books', {
		name: 'update_billing_schedule',
		area: 'books',
		audience: 'everyone',
		isWrite: true,
		summary: "change one of an organisation's billing schedules: any setting, its lines as a whole, pause, resume or end it",
		guidance: changeOnlyWhatThePersonAsked,
		inputSchema: objectSchema({ organisationId: booksOrganisationField, ...billingScheduleChangeFields }, ['organisationId', 'scheduleId']),
		run: async (caller, input, organisation) =>
			answerOrRefusal(booksRefusalOpenings.saving, async () => {
				await changeBillingSchedule(caller.supabase, organisation.id, input);
				const schedule = await readBillingSchedule(caller.supabase, organisation.id, String(input.scheduleId));
				return `Saved. The schedule now reads:\n${schedule}`;
			})
	}),
	moduleAction('books', {
		name: 'list_billing_schedules',
		area: 'books',
		audience: 'everyone',
		isWrite: false,
		summary: "list an organisation's billing schedules in full, or one customer's: settings, lines, and the next invoice with its total and period",
		guidance: readAsTheBooksHoldIt,
		inputSchema: objectSchema({ organisationId: booksOrganisationField, ...billingScheduleFilterFields }, ['organisationId']),
		run: async (caller, input, organisation) =>
			answerOrRefusal(booksRefusalOpenings.reading, async () => {
				const customerId = (input.customerId ?? null) as string | null;
				const customerRefusal = customerId === null ? null : validateRecordId('customer', customerId);
				refuseWhen(customerRefusal);
				return readBillingSchedules(caller.supabase, organisation, { customerId });
			})
	})
];
