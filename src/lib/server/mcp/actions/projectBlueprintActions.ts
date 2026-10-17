import { describeDomain, describeSiteMap } from './describeBlueprint';
import { describeMcpMap } from './describeMcpMap';
import { getProjectBlueprint } from '$lib/server/blueprint/getProjectBlueprint';
import { noSuchProject } from './describeProject';
import { objectSchema, readOptionalText, readText, textField } from '../actionTypes';
import { reachableProject } from '../projectAccess';
import type { McpAction } from '../actionTypes';
import type { McpCaller } from '../resolveMcpCaller';
import type { Project } from '$lib/server/projects/projectRecord';
import type { ProjectBlueprint } from '$lib/data/blueprint/projectBlueprint';

const notReadYet =
	'Nothing read from this project\'s repository yet. Open its Domain or Site map page in YBT, or push to its default branch.';

export const projectBlueprintActions: McpAction[] = [
	{
		name: 'read_project_domain',
		area: 'projects',
		audience: 'everyone',
		isWrite: false,
		summary:
			'read a project\'s business domain as its repository describes it: bounded contexts, aggregates, entities with their fields, and the relationships between them',
		inputSchema: objectSchema({ projectId: textField('The project id') }, ['projectId']),
		run: async (caller, input) => {
			const found = await findBlueprintOfProject(caller, input);
			if (typeof found === 'string') return found;
			const { project, blueprint } = found;
			if (blueprint?.domain == null) return notReadYet;
			return describeDomain(blueprint.domain, project.name);
		}
	},
	{
		name: 'read_project_site_map',
		area: 'projects',
		audience: 'everyone',
		isWrite: false,
		summary:
			'read a project\'s site map from the site definition in its repository: every screen by route, or what a user sees on one screen',
		inputSchema: objectSchema(
			{ projectId: textField('The project id'), route: textField('One screen\'s route, such as /jobs/{Id} — leave out for every screen') },
			['projectId']
		),
		run: async (caller, input) => {
			const found = await findBlueprintOfProject(caller, input);
			if (typeof found === 'string') return found;
			const { project, blueprint } = found;
			if (blueprint?.siteMap == null) return notReadYet;
			return describeSiteMap(blueprint.siteMap, project.name, readOptionalText(input, 'route'));
		}
	},
	{
		name: 'read_project_mcp_map',
		area: 'projects',
		audience: 'everyone',
		isWrite: false,
		summary:
			'read a project\'s MCP map: every user story with the connector tool a Claude uses and the screens a person uses, the parity gaps, and its skills and agents',
		inputSchema: objectSchema({ projectId: textField('The project id') }, ['projectId']),
		run: async (caller, input) => {
			const found = await findBlueprintOfProject(caller, input);
			if (typeof found === 'string') return found;
			const { project, blueprint } = found;
			if (blueprint?.mcpMap == null) return notReadYet;
			return describeMcpMap(blueprint.mcpMap, project.name);
		}
	}
];

type BlueprintOfProject = { project: Project; blueprint: ProjectBlueprint | null };

async function findBlueprintOfProject(
	caller: McpCaller,
	input: Record<string, unknown>
): Promise<BlueprintOfProject | string> {
	const project = await reachableProject(caller, readText(input, 'projectId'));
	if (project === null) return noSuchProject;
	const blueprint = await getProjectBlueprint(caller.supabase, project.id);
	return { project, blueprint };
}
