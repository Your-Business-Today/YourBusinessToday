import { clientProjectSection } from './describeClientProjects';
import { describeWorkflowMap } from './describeWorkflowMap';
import { mapServiceOutlineSection } from './describeMapServiceOutline';
import { mapStageNames } from '$lib/data/workflowMap/workflowMapWords';
import { outlineMapServices } from '$lib/data/workflowMap/mapServiceOutline';
import type { ConfirmedWorkflowMapReading } from '$lib/server/workflowMap/readConfirmedWorkflowMap';
import type { GoalFromWorkflowMap } from '$lib/server/goals/getGoalsFromWorkflowMap';
import type { OrganisationProject } from '$lib/server/projects/getProjectsOfOrganisation';
import type { StationStandings } from '$lib/data/workflowMap/stationReview';

/** Everything a staff member's Claude needs to propose the services a client's confirmed workflow map shows. */
export type ConfirmedWorkflowMapAnswer = {
	organisationName: string;
	reading: ConfirmedWorkflowMapReading;
	standings: StationStandings;
	productNames: Map<string, string>;
	projects: OrganisationProject[];
	goalsRaised: GoalFromWorkflowMap[];
};

export function workflowMapNotConfirmedYet(organisationName: string): string {
	return (
		`${organisationName} has not confirmed a workflow map yet, so there is nothing to raise services from. The ` +
		'client confirms it on Your workflow map in their portal once no station is marked not right; ' +
		'read_workflow_map says where the latest versions stand.'
	);
}

/** The confirmed version whole, the services it suggests, the client's projects and the goals already raised from it. */
export function describeConfirmedWorkflowMap(answer: ConfirmedWorkflowMapAnswer): string {
	const { organisationName, reading, standings, productNames } = answer;
	const { confirmed, map } = reading;
	const surroundings = { productNames, standings, confirmation: confirmed };
	return [
		`Raise services from this confirmed workflow map with workflowMapVersionId ${confirmed.id}.`,
		describeWorkflowMap(organisationName, map, surroundings),
		mapServiceOutlineSection(outlineMapServices(map), productNames),
		clientProjectSection(answer.organisationName, answer.projects),
		raisedSection(answer)
	].join('\n\n');
}

function raisedSection({ projects, goalsRaised }: ConfirmedWorkflowMapAnswer): string {
	const heading = '### Goals already raised from their confirmed workflow map';
	if (goalsRaised.length === 0) return `${heading}\nNone yet.`;
	const projectNames = new Map(projects.map((project) => [project.id, project.name]));
	const lines = goalsRaised.map((goal) => {
		const projectName = projectNames.get(goal.projectId) ?? goal.projectId;
		const version = `${mapStageNames[goal.stage]} version ${goal.versionNumber}`;
		return `- ${goal.title}, on ${projectName}, from the ${version} (goal id: ${goal.id})`;
	});
	return [heading, ...lines].join('\n');
}
