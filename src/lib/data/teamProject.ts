/** A team project is one every Your Business Today staff member is on; only staff make one. */
export const teamProjectLabel = 'YBT team';
export const teamProjectTitle = 'Team project';
export const teamProjectHint =
	'Every Your Business Today staff member is on it, and anyone made staff later joins it at once.';
export const teamProjectsAreForStaff = 'Only Your Business Today staff can make a team project, or make one personal again.';

export const teamProjectField = 'isTeamProject';
export const teamProjectChosen = 'true';
export const teamProjectNotChosen = 'false';

/** The team choice a project form makes; null when the form offered none, as it does for anyone but staff. */
export function readTeamChoiceFrom(formData: FormData): boolean | null {
	const answers = formData.getAll(teamProjectField).map(String);
	if (answers.length === 0) return null;
	return answers.includes(teamProjectChosen);
}

export const teamProjectAnswerRefusal = 'Say isTeamProject as true or false.';

/** A team answer through the connector is true or false; anything else is refused, never read as personal. */
export function validateTeamProjectAnswer(answer: unknown): boolean | null {
	if (typeof answer !== 'boolean') return null;
	return answer;
}
