const directorRoleWords = ['director', 'member'];

/** A director or an LLP member: the people who run the company, as against a secretary who keeps its papers. */
export function isDirectorRole(officerRole: string): boolean {
	return directorRoleWords.some((word) => officerRole.includes(word));
}
