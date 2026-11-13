import { mapStage } from '$lib/data/workflowMap/workflowMap';
import { getProjectsForOrganisation } from '$lib/server/organisations/getProjectsForOrganisation';
import { readLatestWorkflowMap } from '$lib/server/workflowMap/readLatestWorkflowMap';
import { readStationStandings } from '$lib/server/workflowMap/readStationStandings';
import { objectSchema } from '../actionTypes';
import { contextOrganisation } from './contextOrganisation';
import { describeWorkflowMapRun } from './describeWorkflowMapRun';
import { organisationIdField } from './organisationDetailsFields';
import { workflowMapRunActionName } from './workflowMapRunActionName';
import type { McpAction } from '../actionTypes';
import type { McpCaller } from '../resolveMcpCaller';

export const workflowMapRunActions: McpAction[] = [
	{
		name: workflowMapRunActionName,
		area: 'organisations',
		audience: 'everyone',
		isWrite: false,
		summary:
			"start a run that maps an organisation's workflows: the walk to find its roles, their tasks and the hand-overs, " +
			'fitted to the map already filed',
		guidance:
			'"Map the workflows" starts here. It changes nothing: it answers with the walk, a first map when none is filed and, ' +
			'when one is, what the client marked not right first and then only what is missing or unclear. ' +
			"The walk reads the person's connectors read only, asks one question " +
			'at a time and files with file_workflow_map once they say yes.',
		inputSchema: objectSchema({ organisationId: organisationIdField }, ['organisationId']),
		run: async (caller, input) => startWorkflowMapRun(caller, input)
	}
];

async function startWorkflowMapRun(caller: McpCaller, input: Record<string, unknown>): Promise<string> {
	const organisation = await contextOrganisation(caller, input);
	if (typeof organisation === 'string') return organisation;
	const [before, after, projects] = await Promise.all([
		readLatestWorkflowMap(caller.supabase, organisation.id, mapStage.before),
		readLatestWorkflowMap(caller.supabase, organisation.id, mapStage.after),
		getProjectsForOrganisation(caller.supabase, organisation.id)
	]);
	const products = projects.map(({ id, name }) => ({ id, name }));
	const standings = await readStationStandings(caller.supabase, organisation.id, after ?? before);
	return describeWorkflowMapRun({ organisation, before, after, products, standings });
}
