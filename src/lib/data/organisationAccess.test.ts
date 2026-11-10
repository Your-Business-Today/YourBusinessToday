import { describe, expect, it } from 'vitest';
import { deriveProjectMemberships, isOnOrganisation, managesOrganisation, reachesOrganisation } from './organisationAccess';
import {
	jeremy,
	jewelPassiveFire,
	memberships,
	nigel,
	nigelOnJewel,
	passiveFirePortal,
	personalProject,
	projects,
	scarlett,
	stuart
} from './organisationAccess.fixtures';

function projectsReachedBy(accountId: string): string[] {
	return deriveProjectMemberships(memberships, projects)
		.filter((membership) => membership.accountId === accountId)
		.map((membership) => membership.projectId);
}

describe('every organisation is one company', () => {
	it('is reached only by the people on it, and by staff', () => {
		const onJewelAlone = [nigelOnJewel];
		expect(reachesOrganisation({ accountId: nigel, isStaff: false, organisationMemberships: onJewelAlone }, jewelPassiveFire)).toBe(false);
		expect(reachesOrganisation({ accountId: scarlett, isStaff: true, organisationMemberships: [] }, jewelPassiveFire)).toBe(true);
	});

	it('grants its projects through itself alone', () => {
		expect(deriveProjectMemberships([nigelOnJewel], [passiveFirePortal])).toEqual([]);
	});
});

describe('Jeremy, project manager of Jewel Enterprises and of each Jewel company', () => {
	it('adds people to each company he manages', () => {
		expect(managesOrganisation(memberships, jeremy, 'jewel-pfp')).toBe(true);
		expect(managesOrganisation(memberships, jeremy, 'jewel-bb')).toBe(true);
		expect(managesOrganisation(memberships, jeremy, 'jewel')).toBe(true);
	});

	it('manages nothing at Your Business Today, where he is only a member', () => {
		expect(isOnOrganisation(memberships, jeremy, 'ybt')).toBe(true);
		expect(managesOrganisation(memberships, jeremy, 'ybt')).toBe(false);
	});

	it('is on every Jewel project and every Your Business Today project, so he sees each new one', () => {
		expect(projectsReachedBy(jeremy)).toEqual(['pfp-portal', 'pfp-website', 'bb-portal', 'phone-line', 'carp-mania']);
	});
});

describe('Stuart, project manager of Jewel Passive Fire Protection alone', () => {
	it('adds people to Jewel Passive Fire Protection but not to Jewel Enterprises or another company', () => {
		expect(managesOrganisation(memberships, stuart, 'jewel-pfp')).toBe(true);
		expect(managesOrganisation(memberships, stuart, 'jewel')).toBe(false);
		expect(managesOrganisation(memberships, stuart, 'jewel-bb')).toBe(false);
	});

	it('is on the Passive Fire Protection projects and no other Jewel project', () => {
		expect(projectsReachedBy(stuart)).toEqual(['pfp-portal', 'pfp-website']);
	});
});

describe('Nigel, a member of Jewel Enterprises and of each Jewel company', () => {
	it('reaches every Jewel project without managing any organisation', () => {
		expect(managesOrganisation(memberships, nigel, 'jewel')).toBe(false);
		expect(managesOrganisation(memberships, nigel, 'jewel-pfp')).toBe(false);
		expect(projectsReachedBy(nigel)).toEqual(['pfp-portal', 'pfp-website', 'bb-portal', 'phone-line']);
	});

	it('is not made a member of a project he already owns', () => {
		const nigelOwnsPhoneLine = { ...passiveFirePortal, organisationId: 'jewel', ownerId: nigel };
		expect(deriveProjectMemberships([nigelOnJewel], [nigelOwnsPhoneLine])).toEqual([]);
	});
});

describe('a project under no organisation', () => {
	it('is reached by nobody through an organisation', () => {
		expect(deriveProjectMemberships(memberships, [personalProject])).toEqual([]);
	});
});

describe('Stuart and Scarlett, both project managers of Jewel Passive Fire Protection', () => {
	const scarlettManagesPassiveFire = { organisationId: 'jewel-pfp', accountId: scarlett, isManager: true };
	const twoManagers = [...memberships, scarlettManagesPassiveFire];

	it('each manage it, as Jeremy does', () => {
		const managersOfPassiveFire = [stuart, scarlett, jeremy].filter((accountId) =>
			managesOrganisation(twoManagers, accountId, 'jewel-pfp')
		);
		expect(managersOfPassiveFire).toEqual([stuart, scarlett, jeremy]);
	});

	it('leaves Stuart a manager when Scarlett stops being one', () => {
		const scarlettOnPassiveFire = { ...scarlettManagesPassiveFire, isManager: false };
		const oneManager = [...memberships, scarlettOnPassiveFire];
		expect(managesOrganisation(oneManager, scarlett, 'jewel-pfp')).toBe(false);
		expect(managesOrganisation(oneManager, stuart, 'jewel-pfp')).toBe(true);
	});
});
