import { suggestHandOff } from '$lib/server/conversations/defaultHandOff';
import { getProjectPeople } from '$lib/server/members/getProjectPeople';
import { getThread } from '$lib/server/conversations/getThread';
import { parseAwaitingKind, type HandOff } from '$lib/data/conversationTurn';
import { readOptionalText, textField } from '../actionTypes';
import type { McpCaller } from '../resolveMcpCaller';
import type { ProjectPerson } from '$lib/server/members/projectPersonRecord';
import type { ResolvedSubject } from './resolveSubject';

const nobody = 'nobody';

export const handOffFields = {
	waitingOn: textField(
		'Who must answer next: the email or account id of someone on the project, as ' +
			`list_project_people gives it, or "${nobody}" when nothing more is needed. Leave out ` +
			'for whoever spoke last, or failing that whoever raised it'
	),
	waitingFor: textField(
		'"person" (the default) when it needs them — their Claude brings it to them — or "claude" ' +
			'when their Claude can answer from the code and the records on its own'
	)
};

export type HandOffChoice = { handOff: HandOff | null } | { refusal: string };

/** Who the message waits on, as the writer said or as the conversation implies. */
export async function chooseHandOff(
	caller: McpCaller,
	input: Record<string, unknown>,
	resolved: ResolvedSubject
): Promise<HandOffChoice> {
	const waitingOn = readOptionalText(input, 'waitingOn');
	const kind = parseAwaitingKind(readOptionalText(input, 'waitingFor') ?? 'person');
	if (kind === null) return { refusal: 'waitingFor is "person" or "claude". Say which.' };
	if (waitingOn?.toLowerCase() === nobody) return { handOff: null };
	if (waitingOn === null) return { handOff: await impliedHandOff(caller, resolved, kind) };
	const people = await getProjectPeople(caller.supabase, resolved.projectId);
	const person = findPerson(people, waitingOn);
	if (person === null) return { refusal: `${waitingOn} is not on the project. Call list_project_people.` };
	return { handOff: { accountId: person.id, kind } };
}

async function impliedHandOff(
	caller: McpCaller,
	resolved: ResolvedSubject,
	kind: HandOff['kind']
): Promise<HandOff | null> {
	const thread = await getThread(caller.supabase, resolved.subject, true);
	const handOff = suggestHandOff(thread, caller.accountId, resolved.raisedById);
	if (handOff === null) return null;
	return { ...handOff, kind };
}

function findPerson(people: ProjectPerson[], waitingOn: string): ProjectPerson | null {
	const wanted = waitingOn.toLowerCase();
	const matches = (person: ProjectPerson) =>
		person.id === waitingOn || person.email.toLowerCase() === wanted || person.name.toLowerCase() === wanted;
	return people.find(matches) ?? null;
}
