import { readProfitByCostCentre } from '$lib/server/books/booksReports';
import { setCostCentreProject } from '$lib/server/books/costCentreProjects';
import { moduleAction } from '../organisationModuleGate';
import { objectSchema, readText, textField } from '../actionTypes';
import { answerOrRefusal, booksRefusalOpenings } from './booksAnswer';
import { booksOrganisationField, periodEndField, periodStartField } from './booksFields';
import { costCentreIdField } from './booksChartFields';
import { describeProfitByCostCentre } from './describeProfitByCostCentre';
import type { McpAction } from '../actionTypes';

const projectIdField = textField(
	"The project the cost centre is kept for, by its id as list_projects gives it, one of the organisation's own; leave out to keep it for no project"
);

export const booksCostCentreProjectActions: McpAction[] = [
	moduleAction('books', {
		name: 'set_cost_centre_project',
		area: 'books',
		audience: 'everyone',
		isWrite: true,
		summary: "keep one of an organisation's cost centres for one of its own projects, or for none",
		guidance:
			'A project has one cost centre in the books. Every line kept within it, and every bank rule that sets it, ' +
			'counts towards that project in read_profit_by_cost_centre. Keep a supplier that is always for one project to ' +
			'it with a bank rule, rather than tagging its lines one at a time.',
		inputSchema: objectSchema({ organisationId: booksOrganisationField, costCentreId: costCentreIdField, projectId: projectIdField }, [
			'organisationId',
			'costCentreId'
		]),
		run: async (caller, input, organisation) =>
			answerOrRefusal(booksRefusalOpenings.saving, async () => {
				const costCentre = await setCostCentreProject(caller.supabase, organisation.id, input.costCentreId, input.projectId);
				const isKeptForAProject = typeof input.projectId === 'string' && input.projectId !== '';
				const keptFor = isKeptForAProject ? `project ${input.projectId}` : 'no project';
				return `Cost centre ${costCentre.name} is now kept for ${keptFor}.`;
			})
	}),
	moduleAction('books', {
		name: 'read_profit_by_cost_centre',
		area: 'books',
		audience: 'everyone',
		isWrite: false,
		summary: "read each cost centre's income, costs and net profit side by side, with the project each is kept for, for a period and the year to date",
		guidance:
			'What no cost centre carries is shown on its own line, so the lines add up to the whole organisation. ' +
			'Give the person the figures as the books hold them; read_profit_and_loss with a costCentreId gives one by account.',
		inputSchema: objectSchema({ organisationId: booksOrganisationField, periodStart: periodStartField, periodEnd: periodEndField }, [
			'organisationId',
			'periodStart',
			'periodEnd'
		]),
		run: async (caller, input, organisation) =>
			answerOrRefusal(booksRefusalOpenings.reading, async () => {
				const request = { periodStart: input.periodStart, periodEnd: input.periodEnd };
				const report = await readProfitByCostCentre(caller.supabase, organisation.id, request);
				const heading = { organisationName: organisation.name, periodStart: readText(input, 'periodStart'), periodEnd: readText(input, 'periodEnd') };
				return describeProfitByCostCentre(heading, report);
			})
	})
];
