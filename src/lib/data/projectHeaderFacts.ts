import { isPersonalProject, personalProjectHint, personalProjectLabel } from './personalProject';
import { webAddressLabel } from './webAddressLabel';

export type ProjectHeaderFact = { label: string; href?: string; detail?: string };

type HeadedProject = {
	organisationId: string | null;
	repositoryUrl: string;
	environmentUrl: string;
	defaultBranch: string;
};

const noWebAddress = '';
const noOrganisationName = '';
const branchMark = '⎇';
const personalFact: ProjectHeaderFact = { label: personalProjectLabel, detail: personalProjectHint };

/** The organisation a project is for, and the one picked in the side bar, which the top bar already names. */
export type ProjectOrganisation = { organisationName: string; pickedOrganisationId: string | null };

/**
 * The one quiet line under a project's name: whose it is, where its code and its site are, and its branch.
 * Its organisation is named only when it is not the one the top bar leads from.
 */
export function projectHeaderFacts(project: HeadedProject, organisation: ProjectOrganisation): ProjectHeaderFact[] {
	const { repositoryUrl, environmentUrl } = project;
	return [
		...belongingFacts(project, organisation),
		...linkFacts(repositoryUrl),
		...linkFacts(environmentUrl),
		...branchFacts(project)
	];
}

function belongingFacts(project: HeadedProject, organisation: ProjectOrganisation): ProjectHeaderFact[] {
	if (isPersonalProject(project.organisationId)) return [personalFact];
	return organisationFactsFor(project, organisation);
}

function organisationFactsFor(project: HeadedProject, organisation: ProjectOrganisation): ProjectHeaderFact[] {
	const { organisationName, pickedOrganisationId } = organisation;
	const isNamedInTopBar = project.organisationId === pickedOrganisationId;
	if (isNamedInTopBar || organisationName === noOrganisationName) return [];
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
