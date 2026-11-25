import { ukClockAt } from '$lib/data/ukClock';
import { setCashflowItemCostCentre } from '$lib/server/books/cashflowItemCostCentres';
import { readCostProjections } from '$lib/server/books/costProjectionReading';
import { moduleAction } from '../organisationModuleGate';
import { objectSchema, textField } from '../actionTypes';
import { answerOrRefusal, booksRefusalOpenings } from './booksAnswer';
import { booksOrganisationField } from './booksFields';
import { cashflowItemIdField } from './booksCashflowFields';
import { describeCostProjections } from './describeCostProjections';
import type { McpAction } from '../actionTypes';

const itemCostCentreField = textField('The cost centre the item is kept against, by its id as list_cost_centres gives it; leave out to keep it against none');

const byMonthField = textField('Leave out for the end of the twelve-month forecast, or the month to project to, written as 2027-06, at most 60 months ahead');

const todayOnUkClock = (): string => ukClockAt(new Date()).date;

export const booksCostProjectionActions: McpAction[] = [
	moduleAction('books', {
		name: 'set_cashflow_item_cost_centre',
		area: 'books',
		audience: 'everyone',
		isWrite: true,
		summary: "keep an item of an organisation's cashflow forecast against one of its cost centres, or against none",
		guidance:
			'An item kept against the cost centre a project has counts towards what that project will cost, or earn, in ' +
			'read_project_cost_projection. It changes nothing else about the item.',
		inputSchema: objectSchema({ organisationId: booksOrganisationField, cashflowItemId: cashflowItemIdField, costCentreId: itemCostCentreField }, [
			'organisationId',
			'cashflowItemId'
		]),
		run: async (caller, input, organisation) =>
			answerOrRefusal(booksRefusalOpenings.saving, async () => {
				const title = await setCashflowItemCostCentre(caller.supabase, organisation.id, input.cashflowItemId, input.costCentreId);
				const isKeptAgainstOne = typeof input.costCentreId === 'string' && input.costCentreId !== '';
				return `Cashflow item ${title} is now kept against ${isKeptAgainstOne ? `cost centre ${input.costCentreId}` : 'no cost centre'}.`;
			})
	}),
	moduleAction('books', {
		name: 'read_project_cost_projection',
		area: 'books',
		audience: 'everyone',
		isWrite: false,
		summary: 'read what each project has cost and earned so far, and what it will have by the end of each month to a month asked for',
		guidance:
			'So far is every line kept within the project’s cost centre to today; each month after adds the forecast items ' +
			'kept against it. A project also takes its part of each shared cost (read_cost_shares) and of the items kept ' +
			'against one, from the month it is planned to join, so a project due to join lowers the others from then. ' +
			'Give the figures as they come; an item with no cost centre counts towards no project.',
		inputSchema: objectSchema({ organisationId: booksOrganisationField, byMonth: byMonthField }, ['organisationId']),
		run: async (caller, input, organisation) =>
			answerOrRefusal(booksRefusalOpenings.reading, async () => {
				const reading = await readCostProjections(caller.supabase, organisation.id, todayOnUkClock(), input.byMonth);
				return describeCostProjections(organisation.name, reading);
			})
	})
];
