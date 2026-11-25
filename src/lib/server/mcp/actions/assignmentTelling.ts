import type { ProjectPerson } from '$lib/server/members/projectPersonRecord';

/** Who was on a task before an assignment and after it, to say what changed. */
export type AssignmentChange = {
	title: string;
	people: ProjectPerson[];
	beforeIds: string[];
	afterIds: string[];
	callerId: string;
};

const askReminder =
	'Being assigned tells them the task is theirs, not what you need from them: post any question ' +
	'for them as a message waiting on them (post_message with waitingOn).';

/** The answer to an assignment: who is on the task now, who joined, and who was taken off. */
export function assignmentTelling(change: AssignmentChange): string {
	const { title, people, beforeIds, afterIds, callerId } = change;
	const namesFor = (accountIds: string[]) => namesOf(accountIds.map((accountId) => nameOf(people, accountId)));
	const leftIds = beforeIds.filter((accountId) => !afterIds.includes(accountId));
	const toldIds = afterIds.filter((accountId) => !beforeIds.includes(accountId) && accountId !== callerId);
	const nowWith = `"${title}" is now with ${namesFor(afterIds)}.`;
	const takenOff = leftIds.length === 0 ? [] : [`Taken off it: ${namesFor(leftIds)}.`];
	const told = toldIds.length === 0 ? [] : [`${namesFor(toldIds)} told on their bell that it is theirs.`, askReminder];
	return [nowWith, ...takenOff, ...told].join(' ');
}

function nameOf(people: ProjectPerson[], accountId: string): string {
	return people.find((person) => person.id === accountId)?.name ?? accountId;
}

function namesOf(names: string[]): string {
	if (names.length === 0) return 'nobody';
	return names.join(', ');
}
