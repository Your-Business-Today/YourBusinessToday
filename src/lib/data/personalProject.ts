/** A project under no organisation is its owner's own: only they and the people they invite are on it. */
export const personalProjectLabel = 'Personal';
export const personalProjectHint = 'Personal: only you and the people you invite are on it.';
export const organisationProjectHint = 'Under an organisation: everyone on the organisation is on it at once.';

export function isPersonalProject(organisationId: string | null): boolean {
	return organisationId === null;
}
