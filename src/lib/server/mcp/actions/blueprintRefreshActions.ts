import { describeBlueprintReading } from '$lib/server/blueprint/describeBlueprintReading';
import { noSuchProject } from './describeProject';
import { objectSchema, readText, textField } from '../actionTypes';
import { reachableProject } from '../projectAccess';
import { readProjectBlueprint } from '$lib/server/blueprint/readProjectBlueprint';
import type { McpAction } from '../actionTypes';
import type { McpCaller } from '../resolveMcpCaller';

export const blueprintRefreshActions: McpAction[] = [
	{
		name: 'refresh_project_blueprint',
		area: 'projects',
		audience: 'everyone',
		isWrite: true,
		summary: "read a project's domain, site map and MCP map from its repository again, as the Read again button on its Domain page does",
		guidance:
			'Every push to the default branch reads them again by itself; this is for reading what is there now. ' +
			'Then read_project_domain, read_project_site_map and read_project_mcp_map give what was read.',
		inputSchema: objectSchema({ projectId: textField('The project id') }, ['projectId']),
		run: async (caller, input) => refreshBlueprint(caller, readText(input, 'projectId'))
	}
];

async function refreshBlueprint(caller: McpCaller, projectId: string): Promise<string> {
	const project = await reachableProject(caller, projectId);
	if (project === null) return noSuchProject;
	const reading = await readProjectBlueprint(caller.supabase, project);
	return describeBlueprintReading(reading);
}
