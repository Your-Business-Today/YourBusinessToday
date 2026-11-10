import { describe, expect, it } from 'vitest';
import { deriveProjectMemberships, managesOrganisation, type OrganisationMembership } from './organisationAccess';
import { groupedMemberships, jeremy, jewelBespokeBuild, jewelPassiveFire, memberships, nigel, projects } from './organisationAccess.fixtures';

/** What each person on Jewel Enterprises reached through the grouping, before the copy-down. */
const reachedThroughTheGrouping: Record<string, string[]> = {
	[jeremy]: ['pfp-portal', 'pfp-website', 'bb-portal', 'phone-line', 'carp-mania'],
	[nigel]: ['pfp-portal', 'pfp-website', 'bb-portal', 'phone-line']
};

function projectsReachedBy(onOrganisations: OrganisationMembership[], accountId: string): string[] {
	return deriveProjectMemberships(onOrganisations, projects)
		.filter((membership) => membership.accountId === accountId)
		.map((membership) => membership.projectId);
}

describe('a person who was on Jewel Enterprises alone, now that the grouping is not read', () => {
	it('reaches the same projects as before the copy-down, through the people copied to each company', () => {
		expect(projectsReachedBy(memberships, jeremy)).toEqual(reachedThroughTheGrouping[jeremy]);
		expect(projectsReachedBy(memberships, nigel)).toEqual(reachedThroughTheGrouping[nigel]);
	});

	it('would have lost the companies’ projects without the copy-down', () => {
		expect(projectsReachedBy(groupedMemberships, nigel)).toEqual(['phone-line']);
	});

	it('is granted each company’s project through that company, as the copy-down marked it', () => {
		const nigelsGrants = deriveProjectMemberships(memberships, projects).filter((row) => row.accountId === nigel);
		expect(nigelsGrants.find((row) => row.projectId === 'bb-portal')?.viaOrganisationId).toBe(jewelBespokeBuild.id);
	});

	it('still manages each company Jeremy managed from above', () => {
		expect(managesOrganisation(memberships, jeremy, jewelPassiveFire.id)).toBe(true);
		expect(managesOrganisation(memberships, jeremy, jewelBespokeBuild.id)).toBe(true);
	});
});
