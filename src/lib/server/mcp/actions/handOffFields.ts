import { getProjectPeople } from '$lib/server/members/getProjectPeople';
import { isHandedToWriter, selfHandOffRefusal } from '$lib/data/batonRule';
import { parseAwaitingKind, type HandOff } from '$lib/data/conversationTurn';
import { readOptionalText, textField } from '../actionTypes';
import type { McpCaller } from '../resolveMcpCaller';
import type { ProjectPerson } from '$lib/server/members/projectPersonRecord';
import type { ResolvedSubject } from './resolveSubject';

const nobody = 'nobody';

export const handOffFields = {
	waitingOn: textField(
		'Only when this message asks someone else on the project a question they must answer: ' +
			'their email or account id, as list_project_people gives it. Leave out, or say ' +
			`"${nobody}", for anything else — a work log, an answer, a status, or something a ` +
			'person has to do, which is a task assigned to them (set_task_assignees) or a subtask, ' +
			'not a wait. Never yourself'
	),
	waitingFor: textField(
		'"person" (the default) when only they can answer — their Claude brings it to them — or ' +
			'"claude" when their Claude can answer from the code and the records on its own'
	)
};

export type HandOffChoice = { handOff: HandOff | null } | { refusal: string };

/** Who must answer the question the message asks, if it asks one; otherwise nobody. */
export async function chooseHandOff(
	caller: McpCaller,
	input: Record<string, unknown>,
	resolved: ResolvedSubject
): Promise<HandOffChoice> {
	const waitingOn = readOptionalText(input, 'waitingOn');
	const kind = parseAwaitingKind(readOptionalText(input, 'waitingFor') ?? 'person');
	if (kind === null) return { refusal: 'waitingFor is "person" or "claude". Say which.' };
	if (waitingOn === null || waitingOn.toLowerCase() === nobody) return { handOff: null };
	const people = await getProjectPeople(caller.supabase, resolved.projectId);
	const person = findPerson(people, waitingOn);
	if (person === null) return { refusal: `${waitingOn} is not on the project. Call list_project_people.` };
	const handOff = { accountId: person.id, kind };
	if (isHandedToWriter(handOff, caller.accountId)) return { refusal: selfHandOffRefusal };
	return { handOff };
}

function findPerson(people: ProjectPerson[], waitingOn: string): ProjectPerson | null {
	const wanted = waitingOn.toLowerCase();
	const matches = (person: ProjectPerson) =>
		person.id === waitingOn || person.email.toLowerCase() === wanted || person.name.toLowerCase() === wanted;
	return people.find(matches) ?? null;
}
