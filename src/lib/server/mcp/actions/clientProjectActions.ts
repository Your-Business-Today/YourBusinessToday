import { assignProjectToClient } from '$lib/server/projects/assignProjectToClient';
import { getClient } from '$lib/server/clients/getClient';
import { getUnassignedProjects, type UnassignedProject } from '$lib/server/projects/getUnassignedProjects';
import { noSuchClient } from './describeClient';
import { validateRecordId } from '$lib/data/isUuid';
import { objectSchema, readText, textField } from '../actionTypes';
import type { McpAction } from '../actionTypes';
import type { McpCaller } from '../resolveMcpCaller';

export const clientProjectActions: McpAction[] = [
	{
		name: 'list_unassigned_projects',
		area: 'clients',
		audience: 'staff',
		isWrite: false,
		summary: 'live projects that belong to no client yet, ready to be assigned to one',
		inputSchema: objectSchema({}),
		run: async (caller) => describeUnassignedProjects(await getUnassignedProjects(caller.supabase))
	},
	{
		name: 'assign_project_to_client',
		area: 'clients',
		audience: 'staff',
		isWrite: true,
		summary: 'give an unassigned project to a client, with its repository and environment links',
		guidance:
			'Assigning is what opens a project to a client: from that moment their contacts can see ' +
			'it and raise requests against it, so assign it to the company that is paying for it.',
		inputSchema: objectSchema(
			{
				clientId: textField('The client id, as given by list_clients'),
				projectId: textField('The project id, as given by list_unassigned_projects'),
				repositoryUrl: textField('Where the code lives, if you have it'),
				environmentUrl: textField('Where the running site lives, if you have it')
			},
			['clientId', 'projectId']
		),
		run: async (caller, input) => assignProject(caller, input)
	}
];

function describeUnassignedProjects(projects: UnassignedProject[]): string {
	if (projects.length === 0) return 'Every live project already belongs to a client.';
	return projects.map((project) => `${project.name} — id ${project.id}`).join('\n');
}

async function assignProject(caller: McpCaller, input: Record<string, unknown>): Promise<string> {
	const clientId = readText(input, 'clientId');
	const projectId = readText(input, 'projectId');
	const refusal = validateRecordId('clientId', clientId) ?? validateRecordId('projectId', projectId);
	if (refusal !== null) return refusal;
	const client = await getClient(caller.supabase, clientId);
	if (client === null) return noSuchClient;
	const project = (await getUnassignedProjects(caller.supabase)).find((candidate) => candidate.id === projectId);
	if (project === undefined) {
		return 'That project is not waiting to be assigned. Call list_unassigned_projects for the ones that are.';
	}
	const ownership = {
		clientId: client.id,
		repositoryUrl: readText(input, 'repositoryUrl'),
		environmentUrl: readText(input, 'environmentUrl')
	};
	await assignProjectToClient(caller.supabase, project.id, ownership, caller.accountId);
	return `${project.name} now belongs to ${client.name}, and their contacts can raise requests against it.`;
}
