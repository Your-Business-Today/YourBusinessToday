import { postAccrual } from '$lib/server/books/postAccrual';
import { releasePrepayment } from '$lib/server/books/releasePrepayment';
import { findChartNamings } from '$lib/server/books/chartNamings';
import { moduleAction } from '../organisationModuleGate';
import { objectSchema } from '../actionTypes';
import { answerOrRefusal, booksRefusalOpenings } from './booksAnswer';
import { booksOrganisationField } from './booksFields';
import { accrualFields, prepaymentReleaseFields } from './booksPeriodEndFields';
import { describeAccrual, describeRelease } from './describePeriodEnd';
import type { McpAction } from '../actionTypes';

const accrueOnlyWhatThePersonSaid =
	'For a cost the person says was incurred in a month but not yet billed, such as a month of work an accountant has done ' +
	'and not yet invoiced. Accrue only the month, amount and purpose the person gave, never a figure you estimated or a ' +
	'cost they did not name, and code it to the expense account they chose from read_chart_of_accounts, asking which when ' +
	'more than one could fit. It posts the cost at the month\'s end against Accruals (2200) and reverses it on the first ' +
	'of the next month, so when the bill arrives record it with record_expense as usual and it is counted once.';

const releaseOnlyWhatThePersonSaid =
	'For a payment the person says covers several months, such as a year\'s insurance paid up front. The payment itself is ' +
	'recorded first with record_expense, coded to Prepayments (1300); this then moves a share into the expense account at ' +
	'the end of each month it covers. Use only the first month, number of months and whole amount the person gave, never ' +
	'ones you worked out, and the expense account they chose from read_chart_of_accounts. The shares are equal to the ' +
	'penny and the last month carries any pence left over. Release a payment once: a second release posts it twice.';

export const booksPeriodEndActions: McpAction[] = [
	moduleAction('books', {
		name: 'create_accrual',
		area: 'books',
		audience: 'everyone',
		isWrite: true,
		summary: "accrue a cost incurred in a month but not yet billed in an organisation's books, reversed the month after",
		guidance: accrueOnlyWhatThePersonSaid,
		inputSchema: objectSchema({ organisationId: booksOrganisationField, ...accrualFields }, [
			'organisationId',
			'monthKey',
			'amount',
			'description',
			'expenseAccountId'
		]),
		run: async (caller, input, organisation) =>
			answerOrRefusal(booksRefusalOpenings.posting, async () => {
				const accrual = await postAccrual(caller.supabase, organisation.id, input);
				const namings = await findChartNamings(caller.supabase, organisation.id);
				return describeAccrual(organisation.name, accrual, namings);
			})
	}),
	moduleAction('books', {
		name: 'create_prepayment_release',
		area: 'books',
		audience: 'everyone',
		isWrite: true,
		summary: "spread a cost paid up front across the months it covers in an organisation's books, a share each month end",
		guidance: releaseOnlyWhatThePersonSaid,
		inputSchema: objectSchema({ organisationId: booksOrganisationField, ...prepaymentReleaseFields }, [
			'organisationId',
			'firstMonthKey',
			'monthCount',
			'totalAmount',
			'description',
			'expenseAccountId'
		]),
		run: async (caller, input, organisation) =>
			answerOrRefusal(booksRefusalOpenings.posting, async () => {
				const release = await releasePrepayment(caller.supabase, organisation.id, input);
				const namings = await findChartNamings(caller.supabase, organisation.id);
				return describeRelease(organisation.name, release, namings);
			})
	})
];
