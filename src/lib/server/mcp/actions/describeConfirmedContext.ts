import { describeCompanyContext } from './describeCompanyContext';
import { outlineServices } from '$lib/data/companyContext/serviceOutline';
import { serviceOutlineSection } from './describeServiceOutline';
import type { ConfirmedContextReading } from '$lib/server/companyContext/readConfirmedCompanyContext';
import type { GoalFromContext } from '$lib/server/goals/getGoalsRaisedFromContext';
import type { OrganisationProject } from '$lib/server/projects/getProjectsOfOrganisation';

/** Everything a staff member's Claude needs to propose the services a client's confirmed context shows. */
export type ConfirmedContextAnswer = {
	organisationName: string;
	confirmed: ConfirmedContextReading;
	latestVersionNumber: number;
	projects: OrganisationProject[];
	goalsRaised: GoalFromContext[];
};

export function notConfirmedYet(organisationName: string): string {
	return (
		`${organisationName} has not confirmed a company context yet, so there is nothing to raise services from. ` +
		'The client confirms it on the map in their portal once no part is marked not right; read_company_context ' +
		'says where the latest version stands.'
	);
}

/** The confirmed version whole, the services it suggests, the client's projects and the goals already raised from it. */
export function describeConfirmedContext(answer: ConfirmedContextAnswer): string {
	const { organisationName, confirmed } = answer;
	const { versionId, context, confirmation } = confirmed;
	return [
		`Raise services from this confirmed context with contextVersionId ${versionId}.`,
		newerVersionSentence(answer),
		describeCompanyContext(organisationName, context, null, confirmation),
		serviceOutlineSection(outlineServices(context)),
		projectSection(answer),
		raisedSection(answer)
	]
		.filter((paragraph) => paragraph !== '')
		.join('\n\n');
}

function newerVersionSentence({ confirmed, latestVersionNumber }: ConfirmedContextAnswer): string {
	const { confirmation } = confirmed;
	const confirmedNumber = confirmation.versionNumber;
	if (latestVersionNumber <= confirmedNumber) return '';
	return (
		`Version ${latestVersionNumber} has been recorded since and is not confirmed yet: the services come from ` +
		`version ${confirmedNumber}, the one the client confirmed.`
	);
}

function projectSection({ organisationName, projects }: ConfirmedContextAnswer): string {
	const heading = "### The client's projects";
	if (projects.length === 0) return `${heading}\nNo project is under ${organisationName} yet, so no goal can be raised.`;
	const lines = projects.map((project) => {
		const portal = project.isOnClientPortal ? 'on their portal' : 'not on their portal';
		return `- ${project.name} (project id: ${project.id}), ${portal}`;
	});
	return [heading, ...lines].join('\n');
}

function raisedSection({ projects, goalsRaised }: ConfirmedContextAnswer): string {
	const heading = '### Goals already raised from their confirmed context';
	if (goalsRaised.length === 0) return `${heading}\nNone yet.`;
	const projectNames = new Map(projects.map((project) => [project.id, project.name]));
	const lines = goalsRaised.map((goal) => {
		const projectName = projectNames.get(goal.projectId) ?? goal.projectId;
		return `- ${goal.title}, on ${projectName}, from version ${goal.contextVersionNumber} (goal id: ${goal.id})`;
	});
	return [heading, ...lines].join('\n');
}
