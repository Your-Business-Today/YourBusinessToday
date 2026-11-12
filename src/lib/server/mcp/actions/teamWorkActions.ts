import { describeTeamWork } from './describeTeamWork';
import { getOpenTeamWork } from '$lib/server/organisations/getOpenTeamWork';
import { getReachableProjectsOf } from '$lib/server/organisations/getReachableProjectsOf';
import { noSuchOrganisation, reachableOrganisation } from '../organisationAccess';
import { objectSchema, readText } from '../actionTypes';
import { organisationIdField } from './organisationDetailsFields';
import { teamWorkGroups } from '$lib/data/organisationTeamWork';
import { validateRecordId } from '$lib/data/isUuid';
import type { McpAction } from '../actionTypes';
import type { McpCaller } from '../resolveMcpCaller';

export const teamWorkActions: McpAction[] = [
	{
		name: 'read_team_work',
		area: 'organisations',
		audience: 'everyone',
		isWrite: false,
		summary:
			"the open administration, sales and marketing jobs across an organisation's products, department by department, as its Tasks page lists them",
		guidance:
			'Each job is changed on its product with the task id given: update_task_status, set_task_assignees and the rest. ' +
			"Development work is on each product's board, read with read_task_queue.",
		inputSchema: objectSchema({ organisationId: organisationIdField }, ['organisationId']),
		run: async (caller, input) => readTeamWork(caller, readText(input, 'organisationId'))
	}
];

async function readTeamWork(caller: McpCaller, organisationId: string): Promise<string> {
	const idRefusal = validateRecordId('organisationId', organisationId);
	if (idRefusal !== null) return idRefusal;
	const organisation = await reachableOrganisation(caller, organisationId);
	if (organisation === null) return noSuchOrganisation;
	const products = await getReachableProjectsOf(caller.supabase, caller.accountId, organisation.id);
	const tasks = await getOpenTeamWork(caller.supabase, products.map((product) => product.id));
	return describeTeamWork(teamWorkGroups(tasks, products), organisation.name);
}
