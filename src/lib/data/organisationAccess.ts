/** An organisation as the reach rule knows it: one company, on its own. */
export type OrganisationPlace = { id: string };

/** One person on one organisation: a project manager brings people on; a member reaches its projects. */
export type OrganisationMembership = { organisationId: string; accountId: string; isManager: boolean };

export type ProjectPlace = { id: string; ownerId: string; organisationId: string | null };

/** A project membership an organisation grants, and which organisation granted it. */
export type DerivedMembership = { projectId: string; accountId: string; viaOrganisationId: string };

export function isOnOrganisation(
	memberships: OrganisationMembership[],
	accountId: string,
	organisationId: string
): boolean {
	return membershipsOnOrganisation(memberships, accountId, organisationId).length > 0;
}

/** Someone who may be on organisations: staff reach every one, anyone else the ones they are on. */
export type OrganisationVisitor = {
	accountId: string;
	isStaff: boolean;
	organisationMemberships: OrganisationMembership[];
};

/** The one reach rule: staff, or a person on the organisation itself. */
export function reachesOrganisation(visitor: OrganisationVisitor, organisation: OrganisationPlace): boolean {
	if (visitor.isStaff) return true;
	return isOnOrganisation(visitor.organisationMemberships, visitor.accountId, organisation.id);
}

/** A project manager of the organisation itself manages it. */
export function managesOrganisation(
	memberships: OrganisationMembership[],
	accountId: string,
	organisationId: string
): boolean {
	const onOrganisation = membershipsOnOrganisation(memberships, accountId, organisationId);
	return onOrganisation.some((membership) => membership.isManager);
}

/**
 * Every project membership the organisations grant: each person on a project's organisation is on
 * the project — unless they own it, which already reaches it.
 */
export function deriveProjectMemberships(
	memberships: OrganisationMembership[],
	projects: ProjectPlace[]
): DerivedMembership[] {
	return projects.flatMap((project) => membershipsOnProject(project, memberships));
}

function membershipsOnOrganisation(
	memberships: OrganisationMembership[],
	accountId: string,
	organisationId: string
): OrganisationMembership[] {
	return memberships.filter(
		(membership) => membership.accountId === accountId && membership.organisationId === organisationId
	);
}

function membershipsOnProject(project: ProjectPlace, memberships: OrganisationMembership[]): DerivedMembership[] {
	const organisationId = project.organisationId;
	if (organisationId === null) return [];
	return memberships
		.filter((membership) => membership.organisationId === organisationId)
		.filter((membership) => membership.accountId !== project.ownerId)
		.map((membership) => ({ projectId: project.id, accountId: membership.accountId, viaOrganisationId: organisationId }));
}
