import type { OrganisationMembership, OrganisationPlace, ProjectPlace } from './organisationAccess';

/**
 * Jewel Enterprises, two Jewel companies and Your Business Today, each one company; the people on them, as the
 * copy-down left them, and their projects — as the tests know them.
 */
export const jewelEnterprises: OrganisationPlace = { id: 'jewel' };
export const jewelPassiveFire: OrganisationPlace = { id: 'jewel-pfp' };
export const jewelBespokeBuild: OrganisationPlace = { id: 'jewel-bb' };
export const yourBusinessToday: OrganisationPlace = { id: 'ybt' };

export const james = 'james';
export const jeremy = 'jeremy';
export const nigel = 'nigel';
export const stuart = 'stuart';
export const scarlett = 'scarlett';

export const jeremyManagesJewel: OrganisationMembership = { organisationId: 'jewel', accountId: jeremy, isManager: true };
export const nigelOnJewel: OrganisationMembership = { organisationId: 'jewel', accountId: nigel, isManager: false };
export const stuartManagesPassiveFire: OrganisationMembership = { organisationId: 'jewel-pfp', accountId: stuart, isManager: true };
export const jeremyOnYourBusinessToday: OrganisationMembership = { organisationId: 'ybt', accountId: jeremy, isManager: false };

/** Who was on Jewel Enterprises was put on each company beneath it, with the same standing. */
export const copiedDownFromJewel: OrganisationMembership[] = [
	{ organisationId: 'jewel-pfp', accountId: jeremy, isManager: true },
	{ organisationId: 'jewel-pfp', accountId: nigel, isManager: false },
	{ organisationId: 'jewel-bb', accountId: jeremy, isManager: true },
	{ organisationId: 'jewel-bb', accountId: nigel, isManager: false }
];

/** The memberships before the copy-down, when Jewel Enterprises reached its companies through the grouping. */
export const groupedMemberships = [jeremyManagesJewel, nigelOnJewel, stuartManagesPassiveFire, jeremyOnYourBusinessToday];
export const memberships = [...groupedMemberships, ...copiedDownFromJewel];

export const passiveFirePortal: ProjectPlace = { id: 'pfp-portal', ownerId: james, organisationId: 'jewel-pfp' };
export const passiveFireWebsite: ProjectPlace = { id: 'pfp-website', ownerId: james, organisationId: 'jewel-pfp' };
export const bespokeBuildPortal: ProjectPlace = { id: 'bb-portal', ownerId: james, organisationId: 'jewel-bb' };
export const phoneLineAutomation: ProjectPlace = { id: 'phone-line', ownerId: james, organisationId: 'jewel' };
export const carpMania: ProjectPlace = { id: 'carp-mania', ownerId: james, organisationId: 'ybt' };
export const personalProject: ProjectPlace = { id: 'personal', ownerId: nigel, organisationId: null };
export const projects = [passiveFirePortal, passiveFireWebsite, bespokeBuildPortal, phoneLineAutomation, carpMania, personalProject];
