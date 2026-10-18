/** A Companies House officer about to become a person on the register. */
export type OfficerChoice = { officerId: string; name: string };

export const officerNeedsIdAndName = 'An officer is required.';

/** Why the officer cannot be written to people as it stands, or null when it names an officer by id and name. */
export function validateOfficerIdentity(officer: OfficerChoice): string | null {
	if (officer.officerId === '' || officer.name === '') return officerNeedsIdAndName;
	return null;
}
