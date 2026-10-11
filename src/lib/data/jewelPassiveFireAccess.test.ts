import { describe, expect, it } from 'vitest';
import { deriveProjectMemberships, isOnOrganisation, managesOrganisation } from './organisationAccess';
import { canReachProject } from '$lib/server/mcp/projectAccess';
import {
	jeremy,
	memberships,
	organisations,
	passiveFirePortal,
	projects,
	scarlett
} from './organisationAccess.fixtures';
import type { McpCaller } from '$lib/server/mcp/resolveMcpCaller';
import type { OrganisationMembership } from './organisationAccess';

const scarlettOnPassiveFire: OrganisationMembership = { organisationId: 'jewel-pfp', accountId: scarlett, isManager: false };
const withScarlett = [...memberships, scarlettOnPassiveFire];

/** Scarlett's Claude, standing on the project memberships the database holds once Jeremy has added her. */
function scarlettsClaude(): McpCaller {
	const memberProjectIds = deriveProjectMemberships(organisations, withScarlett, projects)
		.filter((membership) => membership.accountId === scarlett)
		.map((membership) => membership.projectId);
	return { accountId: scarlett, ownedProjectIds: [], memberProjectIds } as unknown as McpCaller;
}

describe('Jeremy adds Scarlett to Jewel Passive Fire Protection', () => {
	it('is allowed to, as the project manager of the organisation above it', () => {
		expect(managesOrganisation(memberships, organisations, jeremy, 'jewel-pfp')).toBe(true);
	});

	it('puts her on each Passive Fire Protection project through that sub-organisation', () => {
		const derived = deriveProjectMemberships(organisations, withScarlett, projects);
		expect(derived.filter((membership) => membership.accountId === scarlett)).toEqual([
			{ projectId: 'pfp-portal', accountId: scarlett, viaOrganisationId: 'jewel-pfp' },
			{ projectId: 'pfp-website', accountId: scarlett, viaOrganisationId: 'jewel-pfp' }
		]);
	});
});

describe('Scarlett, once on Jewel Passive Fire Protection', () => {
	it('passes the gate every task action stands behind on its projects, so she can raise tasks there', () => {
		expect(canReachProject(scarlettsClaude(), 'pfp-portal')).toBe(true);
		expect(canReachProject(scarlettsClaude(), 'pfp-website')).toBe(true);
	});

	it('is refused on the Bespoke Build portal and on Your Business Today’s own projects', () => {
		expect(canReachProject(scarlettsClaude(), 'bb-portal')).toBe(false);
		expect(canReachProject(scarlettsClaude(), 'carp-mania')).toBe(false);
	});

	it('is not on Jewel Enterprises itself, so she cannot bring anyone on', () => {
		expect(isOnOrganisation(withScarlett, organisations, scarlett, 'jewel')).toBe(false);
		expect(managesOrganisation(withScarlett, organisations, scarlett, 'jewel-pfp')).toBe(false);
	});

	it('is granted a project through the nearest organisation when she is on both', () => {
		const scarlettOnJewelToo: OrganisationMembership = { organisationId: 'jewel', accountId: scarlett, isManager: false };
		const derived = deriveProjectMemberships(organisations, [scarlettOnPassiveFire, scarlettOnJewelToo], [passiveFirePortal]);
		expect(derived).toEqual([{ projectId: 'pfp-portal', accountId: scarlett, viaOrganisationId: 'jewel-pfp' }]);
	});
});
