/** The limit of boardroom_directors.director_name (migration 0150), stated once for the service and the form. */
export const directorNameMaximumLength = 320;

export const boardroomDirectorRefusals = {
	nameMissing: "A director needs a name; give the person a name or an email first.",
	nameTooLong: `A director's name is at most ${directorNameMaximumLength} characters; give the person a shorter name first.`,
	notOnTheOrganisation:
		'Nobody of that name is on the organisation itself. A director is named from its own people: call read_organisation for them.',
	boardroomIsOff: 'Boardroom is not switched on for this organisation. Switch it on with set_organisation_module first.',
	isDirectorNotBoolean: 'isDirector must be true or false.'
} as const;

export function directorNameRefusal(name: string): string | null {
	if (name.length === 0) return boardroomDirectorRefusals.nameMissing;
	if (name.length <= directorNameMaximumLength) return null;
	return boardroomDirectorRefusals.nameTooLong;
}

export function alreadySittingSentence(name: string, organisationName: string): string {
	return `${name} is already a director of ${organisationName}. Nothing was changed.`;
}

export function notSittingSentence(name: string, organisationName: string): string {
	return `${name} is not a sitting director of ${organisationName}. Nothing was changed.`;
}

export function namedSentence(name: string, organisationName: string): string {
	return `${name} is now a director of ${organisationName}, and enters its boardroom.`;
}

export function stoodDownSentence(name: string, organisationName: string): string {
	return `${name} is stood down as a director of ${organisationName}: they enter no new meetings, and keep their name on every one they took part in.`;
}
