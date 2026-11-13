import { countOf } from '$lib/data/countOf';
import { fileJourneyMap } from '$lib/server/journeyMap/fileJourneyMap';
import { isRefused } from '$lib/server/companyContext/contextText';
import { validateJourneyMap } from '$lib/server/journeyMap/validateJourneyMap';
import { noSuchProject } from './describeProject';
import { journeyMapFields } from './journeyMapFields';
import { objectSchema, readText, textField } from '../actionTypes';
import { reachableProject } from '../projectAccess';
import type { JourneyMapDraft } from '$lib/data/journeyMap/journeyMap';
import type { McpAction } from '../actionTypes';
import type { McpCaller } from '../resolveMcpCaller';

export const projectJourneyMapActions: McpAction[] = [
	{
		name: 'file_project_site_map',
		area: 'projects',
		audience: 'everyone',
		isWrite: true,
		summary:
			"file a whole new version of a product's site map as journeys: its views, which view leads to which, where people arrive, and each role's journeys through the views",
		guidance:
			'Each call files the next numbered version, read from one commit, and never changes one already filed, so ' +
			'give everything the map holds, not only what changed: read_project_site_map first and keep each ' +
			"journey's key. A view is one screen by its route; every link, entry point and journey step names the " +
			'route of a view given in the same call. A journey is one user story for one role, its steps in order, ' +
			'and names the workflow map station it carries out when there is one. Every value is checked against ' +
			'its limit and refused, never cut.',
		inputSchema: objectSchema({ projectId: textField('The product (project) id'), ...journeyMapFields }, [
			'projectId',
			'commit',
			'views'
		]),
		run: async (caller, input) => fileMap(caller, input)
	}
];

async function fileMap(caller: McpCaller, input: Record<string, unknown>): Promise<string> {
	const project = await reachableProject(caller, readText(input, 'projectId'));
	if (project === null) return noSuchProject;
	const draft = validateJourneyMap(input);
	if (isRefused(draft)) return draft.refusal;
	const filing = { projectId: project.id, filedBy: caller.accountId, draft };
	const versionNumber = await fileJourneyMap(caller.supabase, filing);
	return `Filed version ${versionNumber} of ${project.name}'s site map from commit ${draft.commit}: ${contentsOf(draft)}.`;
}

function contentsOf(draft: JourneyMapDraft): string {
	const { views, links, entryPoints, journeys } = draft;
	return [
		countOf(views.length, 'view'),
		countOf(links.length, 'link'),
		countOf(entryPoints.length, 'entry point'),
		countOf(journeys.length, 'journey')
	].join(', ');
}
