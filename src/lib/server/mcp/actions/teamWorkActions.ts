import { describeTeamWork } from './describeTeamWork';
import { jobsShownBy, type TeamWorkFilter } from '$lib/data/teamWorkFilter';
import { loadTeamWork } from '$lib/server/organisations/loadTeamWork';
import { noSuchOrganisation, reachableOrganisation } from '../organisationAccess';
import { objectSchema, readText } from '../actionTypes';
import { organisationIdField } from './organisationDetailsFields';
import { readTeamWorkFilter, teamWorkFilterFields } from './readTeamWorkFilter';
import { teamPeopleOf } from '$lib/data/teamPeople';
import { validateRecordId } from '$lib/data/isUuid';
import type { McpAction } from '../actionTypes';
import type { McpCaller } from '../resolveMcpCaller';
import type { TeamWorkGroup } from '$lib/data/organisationTeamWork';

export const teamWorkActions: McpAction[] = [
	{
		name: 'read_team_work',
		area: 'organisations',
		audience: 'everyone',
		isWrite: false,
		summary:
			"the open administration, sales and marketing jobs across an organisation's products, department by department, with who owns each, as its Tasks page lists them",
		guidance:
			'Filter as the page does: assignedTo "me" for the caller\'s own jobs, "nobody" for the ones nobody has taken, productId, status. ' +
			'Each job is changed on its product with the task id given: set_task_assignees puts a name on it, update_task_status and the rest. ' +
			"Development work is on each product's board, read with read_task_queue.",
		inputSchema: objectSchema({ organisationId: organisationIdField, ...teamWorkFilterFields }, ['organisationId']),
		run: async (caller, input) => readTeamWork(caller, input)
	}
];

async function readTeamWork(caller: McpCaller, input: Record<string, unknown>): Promise<string> {
	const organisationId = readText(input, 'organisationId');
	const idRefusal = validateRecordId('organisationId', organisationId);
	if (idRefusal !== null) return idRefusal;
	const filter = readTeamWorkFilter(input, caller.accountId);
	if (typeof filter === 'string') return filter;
	const organisation = await reachableOrganisation(caller, organisationId);
	if (organisation === null) return noSuchOrganisation;
	const { groups, peopleByProduct } = await loadTeamWork(caller.supabase, caller.accountId, organisation.id);
	const people = teamPeopleOf(peopleByProduct);
	return describeTeamWork(groupsShownBy(groups, filter), organisation.name, people);
}

function groupsShownBy(groups: TeamWorkGroup[], filter: TeamWorkFilter): TeamWorkGroup[] {
	return groups.map((group) => ({ ...group, items: jobsShownBy(group.items, filter) }));
}
