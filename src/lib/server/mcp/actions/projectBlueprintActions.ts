import { describeDomain, describeSiteMap } from './describeBlueprint';
import { getProjectBlueprint } from '$lib/server/blueprint/getProjectBlueprint';
import { noSuchProject } from './describeProject';
import { objectSchema, readOptionalText, readText, textField } from '../actionTypes';
import { reachableProject } from '../projectAccess';
import type { McpAction } from '../actionTypes';

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
			const project = await reachableProject(caller, readText(input, 'projectId'));
			if (project === null) return noSuchProject;
			const blueprint = await getProjectBlueprint(caller.supabase, project.id);
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
			const project = await reachableProject(caller, readText(input, 'projectId'));
			if (project === null) return noSuchProject;
			const blueprint = await getProjectBlueprint(caller.supabase, project.id);
			if (blueprint?.siteMap == null) return notReadYet;
			return describeSiteMap(blueprint.siteMap, project.name, readOptionalText(input, 'route'));
		}
	}
];
