import { describe, expect, it } from 'vitest';
import { projectHeaderFacts } from './projectHeaderFacts';

const harbourSite = {
	organisationId: 'harbour',
	isTeamProject: false,
	repositoryUrl: 'https://github.com/harbour/site',
	environmentUrl: 'https://harbour.example/',
	defaultBranch: 'main'
};
const labelsOf = (facts: { label: string }[]) => facts.map(({ label }) => label);

describe('projectHeaderFacts', () => {
	it('says whose the project is, then where its code and its site are, then its branch', () => {
		const facts = projectHeaderFacts(harbourSite, 'Harbour Builders');
		expect(labelsOf(facts)).toEqual(['Harbour Builders', 'github.com/harbour/site', 'harbour.example', '⎇ main']);
		expect(facts[1].href).toBe('https://github.com/harbour/site');
	});

	it('calls a project under no organisation personal, and a team project the team’s', () => {
		const ownProject = { ...harbourSite, organisationId: null };
		expect(labelsOf(projectHeaderFacts(ownProject, ''))[0]).toBe('Personal');
		expect(labelsOf(projectHeaderFacts({ ...ownProject, isTeamProject: true }, ''))[0]).toBe('YBT team');
	});

	it('names no branch and no address for a project with no repository or site', () => {
		const idea = { ...harbourSite, repositoryUrl: '', environmentUrl: '' };
		expect(labelsOf(projectHeaderFacts(idea, 'Harbour Builders'))).toEqual(['Harbour Builders']);
	});
});
