/** Where an organisation sits: on its own, or under the one organisation it is a business of. */
export type OrganisationPlace = { id: string; parentOrganisationId: string | null };

/** One person on one organisation: a project manager brings people on; a member reaches its projects. */
export type OrganisationMembership = { organisationId: string; accountId: string; isManager: boolean };

export type ProjectPlace = { id: string; ownerId: string; organisationId: string | null };

/** A project membership an organisation grants, and which organisation granted it. */
export type DerivedMembership = { projectId: string; accountId: string; viaOrganisationId: string };

/** The organisation itself and, when it is a sub-organisation, its parent: being on either reaches it. */
export function lineageOf(organisations: OrganisationPlace[], organisationId: string): string[] {
	const organisation = organisations.find((candidate) => candidate.id === organisationId);
	if (organisation === undefined || organisation.parentOrganisationId === null) return [organisationId];
	return [organisationId, organisation.parentOrganisationId];
}

export function isOnOrganisation(
	memberships: OrganisationMembership[],
	organisations: OrganisationPlace[],
	accountId: string,
	organisationId: string
): boolean {
	return membershipsReaching(memberships, organisations, accountId, organisationId).length > 0;
}

/** A project manager of the organisation, or of the organisation it sits under, manages it. */
export function managesOrganisation(
	memberships: OrganisationMembership[],
	organisations: OrganisationPlace[],
	accountId: string,
	organisationId: string
): boolean {
	const reaching = membershipsReaching(memberships, organisations, accountId, organisationId);
	return reaching.some((membership) => membership.isManager);
}

/**
 * Every project membership the organisations grant: each person on a project's organisation, or
 * on the organisation above it, is on the project — unless they own it, which already reaches it.
 */
export function deriveProjectMemberships(
	organisations: OrganisationPlace[],
	memberships: OrganisationMembership[],
	projects: ProjectPlace[]
): DerivedMembership[] {
	return projects.flatMap((project) => membershipsOnProject(project, organisations, memberships));
}

function membershipsReaching(
	memberships: OrganisationMembership[],
	organisations: OrganisationPlace[],
	accountId: string,
	organisationId: string
): OrganisationMembership[] {
	const lineage = lineageOf(organisations, organisationId);
	return memberships.filter(
		(membership) => membership.accountId === accountId && lineage.includes(membership.organisationId)
	);
}

function membershipsOnProject(
	project: ProjectPlace,
	organisations: OrganisationPlace[],
	memberships: OrganisationMembership[]
): DerivedMembership[] {
	if (project.organisationId === null) return [];
	const lineage = lineageOf(organisations, project.organisationId);
	const nearestFirst = memberships
		.filter((membership) => lineage.includes(membership.organisationId))
		.filter((membership) => membership.accountId !== project.ownerId)
		.sort((left, right) => lineage.indexOf(left.organisationId) - lineage.indexOf(right.organisationId));
	const granted = new Map<string, DerivedMembership>();
	for (const membership of nearestFirst) {
		if (granted.has(membership.accountId)) continue;
		granted.set(membership.accountId, {
			projectId: project.id,
			accountId: membership.accountId,
			viaOrganisationId: membership.organisationId
		});
	}
	return [...granted.values()];
}
