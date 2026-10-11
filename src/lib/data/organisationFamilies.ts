import type { OrganisationPlace } from './organisationAccess';

export type NamedOrganisation = OrganisationPlace & { name: string };

/** An organisation with the businesses under it, as the register and the selects list them. */
export type OrganisationFamily<Organisation extends NamedOrganisation> = {
	parent: Organisation;
	children: Organisation[];
};

export function familiesOf<Organisation extends NamedOrganisation>(
	organisations: Organisation[]
): OrganisationFamily<Organisation>[] {
	const parents = organisations.filter((organisation) => organisation.parentOrganisationId === null);
	const parentIds = new Set(parents.map((parent) => parent.id));
	const strays = organisations.filter(
		(organisation) => organisation.parentOrganisationId !== null && !parentIds.has(organisation.parentOrganisationId)
	);
	const families = parents.map((parent) => ({
		parent,
		children: organisations.filter((organisation) => organisation.parentOrganisationId === parent.id)
	}));
	return [...families, ...strays.map((stray) => ({ parent: stray, children: [] }))];
}

/** The organisations in register order: each parent, then the businesses under it. */
export function inFamilyOrder<Organisation extends NamedOrganisation>(organisations: Organisation[]): Organisation[] {
	return familiesOf(organisations).flatMap((family) => [family.parent, ...family.children]);
}

export function organisationNameLookup(organisations: NamedOrganisation[]): (organisationId: string | null) => string {
	const nameById = new Map(organisations.map((organisation) => [organisation.id, organisation.name]));
	return (organisationId) => (organisationId === null ? '' : (nameById.get(organisationId) ?? ''));
}
