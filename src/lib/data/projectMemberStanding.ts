type ProjectMember = { name: string; isOwner: boolean; viaOrganisation: string };

/** A member an organisation brought is named by that organisation; one invited to the project alone is not. */
export function isOnThroughOrganisation(person: { viaOrganisation: string }): boolean {
	return person.viaOrganisation !== '';
}

/** Why a person cannot be taken off the project here, or null when they can. */
export function removalRefusalFor(person: ProjectMember): string | null {
	if (person.isOwner) return 'The owner cannot be removed from their own project.';
	if (!isOnThroughOrganisation(person)) return null;
	return `${person.name} is on this project through ${person.viaOrganisation} — take them off the organisation instead.`;
}
