import { findProjectPerson } from '$lib/server/members/findProjectPerson';
import { getPeopleOnProject } from '$lib/server/members/getPeopleOnProject';
import { isHandedToWriter, isNobodyNamed, nobodyWaiting, selfHandOffRefusal } from '$lib/data/batonRule';
import { parseAwaitingKind, type HandOff } from '$lib/data/conversationTurn';
import { readOptionalText, textField } from '../actionTypes';
import type { McpCaller } from '../resolveMcpCaller';
import type { ResolvedSubject } from './resolveSubject';

export const handOffFields = {
	waitingOn: textField(
		'Only when this message asks someone else on the project a question they must answer: ' +
			'their email or account id, as list_project_people gives it. Leave it out for anything ' +
			'else — a work log, an answer, a status, or something a person has to do, which is a ' +
			'task assigned to them (set_task_assignees) or a subtask, not a wait — and any question ' +
			`still open on the thread stays open. Say "${nobodyWaiting}" when nothing on the thread ` +
			'is waiting on anyone any more: every open question on it is settled. Never yourself'
	),
	waitingFor: textField(
		'"person" (the default) when only they can answer — their Claude brings it to them — or ' +
			'"claude" when their Claude can answer from the code and the records on its own'
	)
};

export type HandOffChoice =
	| { handOff: HandOff | null; isSettlingThread: boolean }
	| { refusal: string };

/** Who must answer the question the message asks, if it asks one; otherwise nobody. */
export async function chooseHandOff(
	caller: McpCaller,
	input: Record<string, unknown>,
	resolved: ResolvedSubject
): Promise<HandOffChoice> {
	const waitingOn = readOptionalText(input, 'waitingOn');
	const kind = parseAwaitingKind(readOptionalText(input, 'waitingFor') ?? 'person');
	if (kind === null) return { refusal: 'waitingFor is "person" or "claude". Say which.' };
	if (waitingOn === null) return { handOff: null, isSettlingThread: false };
	if (isNobodyNamed(waitingOn)) return { handOff: null, isSettlingThread: true };
	const people = await getPeopleOnProject(caller.supabase, resolved.projectId);
	const person = findProjectPerson(people, waitingOn);
	if (person === null) return { refusal: `${waitingOn} is not on the project. Call list_project_people.` };
	const handOff = { accountId: person.id, kind };
	if (isHandedToWriter(handOff, caller.accountId)) return { refusal: selfHandOffRefusal };
	return { handOff, isSettlingThread: false };
}
