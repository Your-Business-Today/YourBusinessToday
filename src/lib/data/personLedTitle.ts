import { nameUsedInTitles } from './personNamedInTitle';

type Person = { name: string; email: string };

const nameLeadSeparator = ':';

export const personLedTitleRefusal =
	'A task title says what the job is, never whose it is: drop the name before the colon, give the ' +
	'task its department, and assign it to them with set_task_assignees.';

/** Whether a title opens with a project person's name and a colon, as in "Jeremy: call Hiscox". */
export function isPersonLedTitle(title: string, people: Person[]): boolean {
	const [lead, ...rest] = title.split(nameLeadSeparator);
	if (rest.length === 0) return false;
	const leadName = lead.trim().toLowerCase();
	const names = people.map((person) => nameUsedInTitles(person.name, person.email));
	return names.some((name) => name !== null && name.toLowerCase() === leadName);
}
