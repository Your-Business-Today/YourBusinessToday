import { readProfitAndLoss } from '$lib/server/books/booksReports';
import { readAccountStatement } from '$lib/server/books/accountStatement';
import { moduleAction } from '../organisationModuleGate';
import { objectSchema, readOptionalText, readText, textField } from '../actionTypes';
import { answerOrRefusal, booksRefusalOpenings } from './booksAnswer';
import { booksOrganisationField, costCentreIdField, periodEndField, periodStartField } from './booksFields';
import { describeProfitAndLoss } from './describeProfitAndLoss';
import { describeAccountStatement } from './describeAccountStatement';
import type { McpAction } from '../actionTypes';

const statementPeriodStartField = textField(
	'Leave out to explain a balance at a day, as the trial balance and balance sheet give it; give the first day, ' +
	'written as 2026-11-01, to explain a period of the profit and loss, or the financial year\'s first day for its year to date'
);

export const booksPeriodActions: McpAction[] = [
	moduleAction('books', {
		name: 'read_profit_and_loss',
		area: 'books',
		audience: 'everyone',
		isWrite: false,
		summary: "read the profit and loss of an organisation's books for a period, with the financial year to date, in one cost centre or all",
		guidance:
			'The year to date runs from the first day of the financial year the period ends in. Give the person the ' +
			'figures as the books hold them, never rounded or estimated; explain_account_balance says what makes up one.',
		inputSchema: objectSchema(
			{ organisationId: booksOrganisationField, periodStart: periodStartField, periodEnd: periodEndField, costCentreId: costCentreIdField },
			['organisationId', 'periodStart', 'periodEnd']
		),
		run: async (caller, input, organisation) =>
			answerOrRefusal(booksRefusalOpenings.reading, async () => {
				const request = { periodStart: input.periodStart, periodEnd: input.periodEnd, costCentreId: input.costCentreId };
				const report = await readProfitAndLoss(caller.supabase, organisation.id, request);
				const heading = {
					organisationName: organisation.name,
					periodStart: readText(input, 'periodStart'),
					periodEnd: readText(input, 'periodEnd'),
					costCentreId: readOptionalText(input, 'costCentreId')
				};
				return describeProfitAndLoss(heading, report);
			})
	}),
	moduleAction('books', {
		name: 'explain_account_balance',
		area: 'books',
		audience: 'everyone',
		isWrite: false,
		summary: "explain a figure in an organisation's books by the entries behind it: each journal on one account, with the balance after it",
		guidance:
			'Name the account by the code the report showed. Use the same days and cost centre as the reading the ' +
			'figure came from, so the closing balance is that figure.',
		inputSchema: objectSchema(
			{
				organisationId: booksOrganisationField,
				accountCode: textField('The account by its code, as the chart of accounts and every report show it, such as 4000'),
				periodStart: statementPeriodStartField,
				periodEnd: periodEndField,
				costCentreId: costCentreIdField
			},
			['organisationId', 'accountCode', 'periodEnd']
		),
		run: async (caller, input, organisation) =>
			answerOrRefusal(booksRefusalOpenings.reading, async () => {
				const request = {
					accountCode: input.accountCode,
					periodStart: input.periodStart,
					periodEnd: input.periodEnd,
					costCentreId: input.costCentreId
				};
				const statement = await readAccountStatement(caller.supabase, organisation.id, request);
				return describeAccountStatement(organisation.name, statement, readOptionalText(input, 'costCentreId'));
			})
	})
];
