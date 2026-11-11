import { describe, expect, it } from 'vitest';
import { projectHeaderFacts } from './projectHeaderFacts';

const harbourSite = {
	organisationId: 'harbour',
	isTeamProject: false,
	repositoryUrl: 'https://github.com/harbour/site',
	environmentUrl: 'https://harbour.example/',
	defaultBranch: 'main'
};
const harbourPicked = { organisationName: 'Harbour Builders', pickedOrganisationId: 'harbour' };
const meadowPicked = { ...harbourPicked, pickedOrganisationId: 'meadow' };
const noOrganisation = { organisationName: '', pickedOrganisationId: 'harbour' };
const labelsOf = (facts: { label: string }[]) => facts.map(({ label }) => label);

describe('projectHeaderFacts', () => {
	it('says where the project’s code and its site are, then its branch', () => {
		const facts = projectHeaderFacts(harbourSite, harbourPicked);
		expect(labelsOf(facts)).toEqual(['github.com/harbour/site', 'harbour.example', '⎇ main']);
		expect(facts[0].href).toBe('https://github.com/harbour/site');
	});

	it('names the organisation first when the side bar has another picked', () => {
		expect(labelsOf(projectHeaderFacts(harbourSite, meadowPicked))[0]).toBe('Harbour Builders');
	});

	it('calls a project under no organisation personal, and a team project the team’s', () => {
		const ownProject = { ...harbourSite, organisationId: null };
		expect(labelsOf(projectHeaderFacts(ownProject, noOrganisation))[0]).toBe('Personal');
		expect(labelsOf(projectHeaderFacts({ ...ownProject, isTeamProject: true }, noOrganisation))[0]).toBe('YBT team');
	});

	it('names no branch and no address for a project with no repository or site', () => {
		const idea = { ...harbourSite, repositoryUrl: '', environmentUrl: '' };
		expect(labelsOf(projectHeaderFacts(idea, meadowPicked))).toEqual(['Harbour Builders']);
	});
});
