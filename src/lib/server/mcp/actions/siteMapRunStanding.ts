import { blueprintSources } from '$lib/data/blueprint/blueprintSources';
import { countOf } from '$lib/data/countOf';
import { repositoryDoorNames } from './siteMapRunActionNames';
import { screenCountOf, type SiteMap } from '$lib/data/blueprint/siteMap';
import { shortCommit } from '$lib/data/journeyMap/journeyMapReading';
import type { JourneyMap } from '$lib/data/journeyMap/journeyMap';
import type { Project } from '$lib/server/projects/projectRecord';
import type { MapLine, WorkflowMapVersion } from '$lib/data/workflowMap/workflowMap';

/** What Your Business Today holds for a product that bears on its journeys, as the site map run reads it first. */
export type SiteMapRunStanding = {
	project: Project;
	organisationName: string | null;
	headCommit: string | null;
	journeyMap: JourneyMap | null;
	siteDefinition: SiteMap | null;
	workflowMap: WorkflowMapVersion | null;
};

/** Step 1 of the site map run: what is held already, and what the run builds on. */
export function siteMapRunStanding(standing: SiteMapRunStanding): string {
	return [
		'1. **Say what Your Business Today holds already.**',
		repositoryHeld(standing),
		journeysHeld(standing),
		siteDefinitionHeld(standing),
		stationsHeld(standing)
	].join('\n');
}

function repositoryHeld({ project, headCommit }: SiteMapRunStanding): string {
	const { name, repositoryUrl, defaultBranch } = project;
	if (repositoryUrl === '') return `   - Repository: none recorded on ${name}, so there is nothing to map yet. Tell the person its owner records one with update_project_details, and stop.`;
	if (headCommit === null)
		return `   - Repository: ${repositoryUrl}, which the site's GitHub access cannot read. Read it with your own GitHub at the head of ${defaultBranch}, and file the map with that commit; with no GitHub of your own, ask an administrator to give the site access, and stop.`;
	return `   - Repository: ${repositoryUrl}, at commit ${headCommit}, the head of ${defaultBranch}. Read every file at that commit and file the map with it, so the map says exactly what it was read from.`;
}

function journeysHeld({ project, journeyMap }: SiteMapRunStanding): string {
	if (journeyMap === null) return `   - The journeys: none filed yet, so this is the first map of ${project.name}.`;
	const { versionNumber, views, journeys } = journeyMap;
	const contents = `${countOf(views.length, 'view')} and ${countOf(journeys.length, 'journey')}`;
	return `   - The journeys: version ${versionNumber}, read from commit ${shortCommit(journeyMap)}, with ${contents}. Read it with read_project_site_map first, build on it and keep each journey's key.`;
}

function siteDefinitionHeld({ siteDefinition }: SiteMapRunStanding): string {
	const path = blueprintSources.siteDefinitionPath;
	if (siteDefinition === null) return `   - The kit's site definition: none read. The repository needs no kit and no file of ours; if it does carry ${path}, start from it.`;
	return `   - The kit's site definition: ${path} drew ${countOf(screenCountOf(siteDefinition), 'screen')} when last read. Start from it: read it with ${repositoryDoorNames.readFile}, take its routes as the first list of views and check each against the code.`;
}

function stationsHeld({ organisationName, workflowMap, project }: SiteMapRunStanding): string {
	if (organisationName === null) return `   - Workflow map: ${project.name} belongs to no organisation, so its journeys name no station.`;
	if (workflowMap === null) return `   - Workflow map: none filed for ${organisationName} yet, so the journeys name no station this time.`;
	const { stage, versionNumber, lines } = workflowMap;
	const lit = lines.flatMap((line) => stationsDoneIn(line, project.id));
	const map = `${organisationName}'s workflow map, ${stage} version ${versionNumber}`;
	if (lit.length === 0) return `   - ${map}: none of its stations is done in ${project.name} yet. Read it with read_workflow_map and name a station only where a journey plainly carries it out.`;
	return `   - ${map}: the stations done in ${project.name} are ${lit.join('; ')}. Name one of these on each journey that carries it out; read_workflow_map holds the rest.`;
}

function stationsDoneIn(line: MapLine, projectId: string): string[] {
	const done = line.stations.filter((station) => station.productId === projectId);
	return done.map((station) => `${station.key} (${station.name}, ${line.name})`);
}
