export type NamedOrganisation = { id: string; name: string };

export function organisationNameLookup(organisations: NamedOrganisation[]): (organisationId: string | null) => string {
	const nameById = new Map(organisations.map((organisation) => [organisation.id, organisation.name]));
	return (organisationId) => (organisationId === null ? '' : (nameById.get(organisationId) ?? ''));
}
