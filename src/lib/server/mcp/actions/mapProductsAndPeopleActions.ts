import { peopleInTheLoopOf } from '$lib/data/workflowMap/peopleInTheLoop';
import { productsOnTheMap } from '$lib/data/workflowMap/productsOnTheMap';
import { mapStage } from '$lib/data/workflowMap/workflowMap';
import { readOrganisationWorkflowMaps } from '$lib/server/workflowMap/readOrganisationWorkflowMaps';
import { objectSchema } from '../actionTypes';
import { contextOrganisation } from './contextOrganisation';
import { describeMapProducts } from './describeMapProducts';
import { describePeopleInTheLoop } from './describePeopleInTheLoop';
import { noWorkflowMapYet } from './describeWorkflowMap';
import { organisationIdField } from './organisationDetailsFields';
import type { McpAction } from '../actionTypes';
import type { McpCaller } from '../resolveMcpCaller';
import type { OrganisationWorkflowMaps } from '$lib/data/workflowMap/organisationWorkflowMaps';
import type { Organisation } from '$lib/server/organisations/organisationRecord';
import type { WorkflowMapVersion } from '$lib/data/workflowMap/workflowMap';

type FiledMaps = OrganisationWorkflowMaps & { after: WorkflowMapVersion };

const readFromTheAfter = 'Both are read from the After map, as the Products and People in the loop tabs of the Workflow map page show them.';

export const mapProductsAndPeopleActions: McpAction[] = [
	{
		name: 'read_map_products',
		area: 'organisations',
		audience: 'everyone',
		isWrite: false,
		summary:
			"read the products an organisation's After workflow map recommends: each one live or planned, the steps it takes on " +
			'with the line each sits on, and what goes wrong today in the hand-overs those steps touch',
		guidance: `${readFromTheAfter} A product is named by its project, else by where its steps are done (doneIn).`,
		inputSchema: objectSchema({ organisationId: organisationIdField }, ['organisationId']),
		run: async (caller, input) =>
			withFiledAfter(caller, input, (organisation, maps) => describeMapProducts(organisation.name, maps.after, productsOnTheMap(maps)))
	},
	{
		name: 'read_people_in_the_loop',
		area: 'organisations',
		audience: 'everyone',
		isWrite: false,
		summary:
			"read where people stay in the loop on an organisation's After workflow map: for each role, the steps that stay theirs, " +
			'the steps they do inside one of our products, and the steps taken off their hands since the Before',
		guidance: readFromTheAfter,
		inputSchema: objectSchema({ organisationId: organisationIdField }, ['organisationId']),
		run: async (caller, input) =>
			withFiledAfter(caller, input, (organisation, maps) =>
				describePeopleInTheLoop(organisation.name, maps.after, peopleInTheLoopOf(maps), maps.before !== null)
			)
	}
];

async function withFiledAfter(
	caller: McpCaller,
	input: Record<string, unknown>,
	describe: (organisation: Organisation, maps: FiledMaps) => string
): Promise<string> {
	const organisation = await contextOrganisation(caller, input);
	if (typeof organisation === 'string') return organisation;
	const maps = await readOrganisationWorkflowMaps(caller.supabase, organisation.id);
	const { after } = maps;
	if (after === null) return noWorkflowMapYet(organisation.name, mapStage.after);
	return describe(organisation, { ...maps, after });
}
