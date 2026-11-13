import { describeBillingRun } from '$lib/data/books/billingRunReport';
import { ukClockAt } from '$lib/data/ukClock';
import { runBillingSchedules } from '$lib/server/books/billingRun';
import { moduleAction } from '../organisationModuleGate';
import { objectSchema } from '../actionTypes';
import { answerOrRefusal, booksRefusalOpenings } from './booksAnswer';
import { booksOrganisationField } from './booksFields';
import type { McpAction } from '../actionTypes';

const runOnlyWhenThePersonSaysSo =
	'Run it only when the person asks to raise the schedules now rather than wait for the hourly run: it raises today ' +
	'what is due, and issues and emails the invoices of schedules that send by themselves, to real customers. Read the ' +
	'answer back as it is, every invoice and everything left.';

export const booksBillingRunActions: McpAction[] = [
	moduleAction('books', {
		name: 'run_billing_schedules',
		area: 'books',
		audience: 'everyone',
		isWrite: true,
		summary:
			"raise now the invoices an organisation's billing schedules have due today, issuing and emailing those that send " +
			'by themselves, as the hourly run does',
		guidance: runOnlyWhenThePersonSaysSo,
		inputSchema: objectSchema({ organisationId: booksOrganisationField }, ['organisationId']),
		run: async (caller, _input, organisation) =>
			answerOrRefusal(booksRefusalOpenings.saving, async () => {
				const request = { organisationId: organisation.id, today: ukClockAt(new Date()).date, sentByAccountId: caller.accountId };
				const events = await runBillingSchedules(caller.supabase, request);
				return `${organisation.name}'s billing schedules for today: ${describeBillingRun(events)}`;
			})
	})
];
