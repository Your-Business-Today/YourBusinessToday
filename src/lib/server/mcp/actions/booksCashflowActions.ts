import { ukClockAt } from '$lib/data/ukClock';
import { readCashflowForecast } from '$lib/server/books/cashflowForecastReading';
import { addCashflowItem, changeCashflowItem } from '$lib/server/books/saveCashflowItem';
import { moduleAction } from '../organisationModuleGate';
import { objectSchema } from '../actionTypes';
import { answerOrRefusal, booksRefusalOpenings } from './booksAnswer';
import { booksOrganisationField } from './booksFields';
import { cashflowItemChangeFields, newCashflowItemFields } from './booksCashflowFields';
import { describeCashflowForecast, describeCashflowItemLine } from './describeCashflowForecast';
import type { McpAction } from '../actionTypes';

const onlyTheDirectorsFigures =
	'Take every figure from the directors as they gave it; never estimate one. Running billing schedules are already counted ' +
	'as money in, so never add their invoices here. To stop a repeating item, set its lastMonth with update_cashflow_item.';

const todayOnUkClock = (): string => ukClockAt(new Date()).date;

export const booksCashflowActions: McpAction[] = [
	moduleAction('books', {
		name: 'read_cashflow_forecast',
		area: 'books',
		audience: 'everyone',
		isWrite: false,
		summary: "read an organisation's 12-month cashflow forecast: cash at bank today, each month's money in and out, and the items kept",
		guidance: 'Give the figures as the forecast holds them, and say in which month the cash runs out when it does.',
		inputSchema: objectSchema({ organisationId: booksOrganisationField }, ['organisationId']),
		run: async (caller, _input, organisation) =>
			answerOrRefusal(booksRefusalOpenings.reading, async () => {
				const reading = await readCashflowForecast(caller.supabase, organisation.id, todayOnUkClock());
				return describeCashflowForecast(organisation.name, reading);
			})
	}),
	moduleAction('books', {
		name: 'add_cashflow_item',
		area: 'books',
		audience: 'everyone',
		isWrite: true,
		summary: "add an item to an organisation's cashflow forecast: money expected in or out, once or every month, quarter or year",
		guidance: onlyTheDirectorsFigures,
		inputSchema: objectSchema({ organisationId: booksOrganisationField, ...newCashflowItemFields }, [
			'organisationId',
			'title',
			'direction',
			'amount',
			'repeats',
			'firstMonth'
		]),
		run: async (caller, input, organisation) =>
			answerOrRefusal(booksRefusalOpenings.saving, async () => {
				const item = await addCashflowItem(caller.supabase, organisation.id, input);
				return `Added to ${organisation.name}'s cashflow forecast:\n${describeCashflowItemLine(item)}`;
			})
	}),
	moduleAction('books', {
		name: 'update_cashflow_item',
		area: 'books',
		audience: 'everyone',
		isWrite: true,
		summary: "change an item of an organisation's cashflow forecast, or end a repeating one by giving its last month",
		guidance: `Give only what the person asked to change. ${onlyTheDirectorsFigures}`,
		inputSchema: objectSchema({ organisationId: booksOrganisationField, ...cashflowItemChangeFields }, ['organisationId', 'cashflowItemId']),
		run: async (caller, input, organisation) =>
			answerOrRefusal(booksRefusalOpenings.changing, async () => {
				const { before, after } = await changeCashflowItem(caller.supabase, organisation.id, input);
				return `Changed in ${organisation.name}'s cashflow forecast. It read:\n${describeCashflowItemLine(before)}\nIt now reads:\n${describeCashflowItemLine(after)}`;
			})
	})
];
