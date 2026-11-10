import { addCostCentre, findCostCentres, setCostCentreArchived } from '$lib/server/books/costCentres';
import { moduleAction } from '../organisationModuleGate';
import { objectSchema } from '../actionTypes';
import { answerOrRefusal, booksRefusalOpenings } from './booksAnswer';
import { booksOrganisationField } from './booksFields';
import { archiveVerdict, archivingKeepsHistory, costCentreIdField, costCentreNameField, isArchivedField } from './booksChartFields';
import { describeCostCentre, describeCostCentres } from './describeChartOfAccounts';
import type { McpAction } from '../actionTypes';

const oneCostCentrePerThing =
	'List the cost centres first and add one only when none there is the thing the person names; two cost centres ' +
	'of one name split its figures.';

export const booksCostCentreActions: McpAction[] = [
	moduleAction('books', {
		name: 'list_cost_centres',
		area: 'books',
		audience: 'everyone',
		isWrite: false,
		summary: "list an organisation's cost centres, archived ones marked, with the id of each",
		guidance: 'A journal line, a statement or a report is kept within a cost centre by the id given here.',
		inputSchema: objectSchema({ organisationId: booksOrganisationField }, ['organisationId']),
		run: async (caller, _input, organisation) => {
			const costCentres = await findCostCentres(caller.supabase, organisation.id);
			return describeCostCentres(organisation.name, costCentres);
		}
	}),
	moduleAction('books', {
		name: 'create_cost_centre',
		area: 'books',
		audience: 'everyone',
		isWrite: true,
		summary: "add a cost centre an organisation's income and costs can be kept within",
		guidance: oneCostCentrePerThing,
		inputSchema: objectSchema({ organisationId: booksOrganisationField, name: costCentreNameField }, ['organisationId', 'name']),
		run: async (caller, input, organisation) =>
			answerOrRefusal(booksRefusalOpenings.saving, async () => {
				const costCentre = await addCostCentre(caller.supabase, organisation.id, input.name);
				return `Added to ${organisation.name}'s cost centres:\n${describeCostCentre(costCentre)}`;
			})
	}),
	moduleAction('books', {
		name: 'set_cost_centre_archived',
		area: 'books',
		audience: 'everyone',
		isWrite: true,
		summary: "archive one of an organisation's cost centres, or bring it back",
		guidance: archivingKeepsHistory,
		inputSchema: objectSchema({ organisationId: booksOrganisationField, costCentreId: costCentreIdField, isArchived: isArchivedField }, [
			'organisationId',
			'costCentreId',
			'isArchived'
		]),
		run: async (caller, input, organisation) =>
			answerOrRefusal(booksRefusalOpenings.saving, async () => {
				const costCentre = await setCostCentreArchived(caller.supabase, organisation.id, input.costCentreId, input.isArchived);
				return `Cost centre ${costCentre.name} ${archiveVerdict(costCentre.isArchived)}.`;
			})
	})
];
