import { contextOrganisation } from './contextOrganisation';
import { describeConfirmedWorkflowMap, workflowMapNotConfirmedYet } from './describeConfirmedWorkflowMap';
import { getGoalsFromWorkflowMap } from '$lib/server/goals/getGoalsFromWorkflowMap';
import { getProjectsOfOrganisation } from '$lib/server/projects/getProjectsOfOrganisation';
import { objectSchema } from '../actionTypes';
import { organisationIdField } from './organisationDetailsFields';
import { productIdsOf, readProductsOfOrganisation } from '$lib/server/workflowMap/mapProducts';
import { readConfirmedWorkflowMap } from '$lib/server/workflowMap/readConfirmedWorkflowMap';
import { readStationStandings } from '$lib/server/workflowMap/readStationStandings';
import type { McpAction } from '../actionTypes';
import type { McpCaller } from '../resolveMcpCaller';

export const mapServicesGuidance =
	'Propose the services as one list for the staff member: one service per product, built around the stations planned ' +
	'for it, outputs first, each saying which hand-overs that go wrong today it puts right. Change the grouping where ' +
	'the map shows a better one, and say why. Raise nothing until the staff member agrees, as raising a goal always ' +
	"works: then raise each service they agreed as a goal on the client's project with create_goal_with_tasks, with a " +
	'measure the client can check, its first tasks and workflowMapVersionId, so the goal links back to the confirmed ' +
	'map and the client sees it on their portal. A service already raised from their confirmed map is not raised again.';

export const confirmedWorkflowMapActions: McpAction[] = [
	{
		name: 'read_confirmed_workflow_map',
		area: 'organisations',
		audience: 'staff',
		isWrite: false,
		summary:
			'read the workflow map a client confirmed last, whole, with the stations planned for our products as the ' +
			"outline of services, the hand-overs that go wrong today, the client's projects and the goals already raised from it",
		guidance: mapServicesGuidance,
		inputSchema: objectSchema({ organisationId: organisationIdField }, ['organisationId']),
		run: async (caller, input) => readConfirmedMap(caller, input)
	}
];

async function readConfirmedMap(caller: McpCaller, input: Record<string, unknown>): Promise<string> {
	const organisation = await contextOrganisation(caller, input);
	if (typeof organisation === 'string') return organisation;
	const reading = await readConfirmedWorkflowMap(caller.supabase, organisation.id);
	if (reading === null) return workflowMapNotConfirmedYet(organisation.name);
	const { map } = reading;
	const productNames = await readProductsOfOrganisation(caller.supabase, organisation.id, productIdsOf(map.lines));
	const standings = await readStationStandings(caller.supabase, organisation.id, map);
	const projects = await getProjectsOfOrganisation(caller.supabase, organisation.id);
	const projectIds = projects.map((project) => project.id);
	const goalsRaised = await getGoalsFromWorkflowMap(caller.supabase, projectIds);
	return describeConfirmedWorkflowMap({ organisationName: organisation.name, reading, standings, productNames, projects, goalsRaised });
}
