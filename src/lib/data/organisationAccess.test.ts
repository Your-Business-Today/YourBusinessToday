import { describe, expect, it } from 'vitest';
import { deriveProjectMemberships, isOnOrganisation, lineageOf, managesOrganisation } from './organisationAccess';
import {
	jeremy,
	memberships,
	nigel,
	nigelOnJewel,
	organisations,
	passiveFirePortal,
	personalProject,
	projects,
	stuart
} from './organisationAccess.fixtures';

function projectsReachedBy(accountId: string): string[] {
	return deriveProjectMemberships(organisations, memberships, projects)
		.filter((membership) => membership.accountId === accountId)
		.map((membership) => membership.projectId);
}

describe('a sub-organisation sits under its parent', () => {
	it('is reached through itself or through the parent, and a parent only through itself', () => {
		expect(lineageOf(organisations, 'jewel-pfp')).toEqual(['jewel-pfp', 'jewel']);
		expect(lineageOf(organisations, 'jewel')).toEqual(['jewel']);
	});
});

describe('Jeremy, project manager of Jewel Enterprises', () => {
	it('adds people to Jewel Passive Fire Protection because he manages the organisation above it', () => {
		expect(managesOrganisation(memberships, organisations, jeremy, 'jewel-pfp')).toBe(true);
		expect(managesOrganisation(memberships, organisations, jeremy, 'jewel-bb')).toBe(true);
		expect(managesOrganisation(memberships, organisations, jeremy, 'jewel')).toBe(true);
	});

	it('manages nothing at Your Business Today, where he is only a member', () => {
		expect(isOnOrganisation(memberships, organisations, jeremy, 'ybt')).toBe(true);
		expect(managesOrganisation(memberships, organisations, jeremy, 'ybt')).toBe(false);
	});

	it('is on every Jewel project and every Your Business Today project, so he sees each new one', () => {
		expect(projectsReachedBy(jeremy)).toEqual(['pfp-portal', 'pfp-website', 'bb-portal', 'phone-line', 'carp-mania']);
	});
});

describe('Stuart, project manager of Jewel Passive Fire Protection alone', () => {
	it('adds people to Jewel Passive Fire Protection but not to Jewel Enterprises or its other businesses', () => {
		expect(managesOrganisation(memberships, organisations, stuart, 'jewel-pfp')).toBe(true);
		expect(managesOrganisation(memberships, organisations, stuart, 'jewel')).toBe(false);
		expect(managesOrganisation(memberships, organisations, stuart, 'jewel-bb')).toBe(false);
	});

	it('is on the Passive Fire Protection projects and no other Jewel project', () => {
		expect(projectsReachedBy(stuart)).toEqual(['pfp-portal', 'pfp-website']);
	});
});

describe('Nigel, a member of Jewel Enterprises', () => {
	it('reaches every Jewel project without managing any organisation', () => {
		expect(managesOrganisation(memberships, organisations, nigel, 'jewel')).toBe(false);
		expect(managesOrganisation(memberships, organisations, nigel, 'jewel-pfp')).toBe(false);
		expect(projectsReachedBy(nigel)).toEqual(['pfp-portal', 'pfp-website', 'bb-portal', 'phone-line']);
	});

	it('is not made a member of a project he already owns', () => {
		const nigelOwnsPassiveFirePortal = { ...passiveFirePortal, ownerId: nigel };
		expect(deriveProjectMemberships(organisations, [nigelOnJewel], [nigelOwnsPassiveFirePortal])).toEqual([]);
	});
});

describe('a project under no organisation', () => {
	it('is reached by nobody through an organisation', () => {
		expect(deriveProjectMemberships(organisations, memberships, [personalProject])).toEqual([]);
	});
});
