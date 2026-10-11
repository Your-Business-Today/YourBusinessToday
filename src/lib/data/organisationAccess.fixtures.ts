import type { OrganisationMembership, OrganisationPlace, ProjectPlace } from './organisationAccess';

/** Jewel Enterprises with its businesses, Your Business Today, the people on them and their projects — as the tests know them. */
export const jewelEnterprises: OrganisationPlace = { id: 'jewel', parentOrganisationId: null };
export const jewelPassiveFire: OrganisationPlace = { id: 'jewel-pfp', parentOrganisationId: 'jewel' };
export const jewelBespokeBuild: OrganisationPlace = { id: 'jewel-bb', parentOrganisationId: 'jewel' };
export const yourBusinessToday: OrganisationPlace = { id: 'ybt', parentOrganisationId: null };
export const organisations = [jewelEnterprises, jewelPassiveFire, jewelBespokeBuild, yourBusinessToday];

export const james = 'james';
export const jeremy = 'jeremy';
export const nigel = 'nigel';
export const stuart = 'stuart';
export const scarlett = 'scarlett';

export const jeremyManagesJewel: OrganisationMembership = { organisationId: 'jewel', accountId: jeremy, isManager: true };
export const nigelOnJewel: OrganisationMembership = { organisationId: 'jewel', accountId: nigel, isManager: false };
export const stuartManagesPassiveFire: OrganisationMembership = { organisationId: 'jewel-pfp', accountId: stuart, isManager: true };
export const jeremyOnYourBusinessToday: OrganisationMembership = { organisationId: 'ybt', accountId: jeremy, isManager: false };
export const memberships = [jeremyManagesJewel, nigelOnJewel, stuartManagesPassiveFire, jeremyOnYourBusinessToday];

export const passiveFirePortal: ProjectPlace = { id: 'pfp-portal', ownerId: james, organisationId: 'jewel-pfp' };
export const passiveFireWebsite: ProjectPlace = { id: 'pfp-website', ownerId: james, organisationId: 'jewel-pfp' };
export const bespokeBuildPortal: ProjectPlace = { id: 'bb-portal', ownerId: james, organisationId: 'jewel-bb' };
export const phoneLineAutomation: ProjectPlace = { id: 'phone-line', ownerId: james, organisationId: 'jewel' };
export const carpMania: ProjectPlace = { id: 'carp-mania', ownerId: james, organisationId: 'ybt' };
export const personalProject: ProjectPlace = { id: 'personal', ownerId: nigel, organisationId: null };
export const projects = [passiveFirePortal, passiveFireWebsite, bespokeBuildPortal, phoneLineAutomation, carpMania, personalProject];
