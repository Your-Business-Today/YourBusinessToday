import { isPersonalProject, personalProjectHint, personalProjectLabel } from './personalProject';
import { teamProjectHint, teamProjectLabel } from './teamProject';
import { webAddressLabel } from './webAddressLabel';

export type ProjectHeaderFact = { label: string; href?: string; detail?: string };

type HeadedProject = {
	organisationId: string | null;
	isTeamProject: boolean;
	repositoryUrl: string;
	environmentUrl: string;
	defaultBranch: string;
};

const noWebAddress = '';
const noOrganisationName = '';
const branchMark = '⎇';
const teamFact: ProjectHeaderFact = { label: teamProjectLabel, detail: teamProjectHint };
const personalFact: ProjectHeaderFact = { label: personalProjectLabel, detail: personalProjectHint };

/** The one quiet line under a project's name: whose it is, where its code and its site are, and its branch. */
export function projectHeaderFacts(project: HeadedProject, organisationName: string): ProjectHeaderFact[] {
	const { repositoryUrl, environmentUrl } = project;
	return [
		...belongingFacts(project, organisationName),
		...linkFacts(repositoryUrl),
		...linkFacts(environmentUrl),
		...branchFacts(project)
	];
}

function belongingFacts(project: HeadedProject, organisationName: string): ProjectHeaderFact[] {
	if (project.isTeamProject) return [teamFact, ...organisationFacts(organisationName)];
	if (isPersonalProject(project.organisationId)) return [personalFact];
	return organisationFacts(organisationName);
}

function organisationFacts(organisationName: string): ProjectHeaderFact[] {
	if (organisationName === noOrganisationName) return [];
	return [{ label: organisationName }];
}

function linkFacts(webAddress: string): ProjectHeaderFact[] {
	if (webAddress === noWebAddress) return [];
	return [{ label: webAddressLabel(webAddress), href: webAddress }];
}

function branchFacts(project: HeadedProject): ProjectHeaderFact[] {
	if (project.repositoryUrl === noWebAddress) return [];
	return [{ label: `${branchMark} ${project.defaultBranch}` }];
}
