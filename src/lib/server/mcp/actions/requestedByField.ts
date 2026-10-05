import { findProjectPerson } from '$lib/server/members/findProjectPerson';
import { getProjectPeople } from '$lib/server/members/getProjectPeople';
import { readOptionalText, textField } from '../actionTypes';
import type { McpCaller } from '../resolveMcpCaller';

export const requestedByField = textField(
	'Who asked for it, when you raise it for someone else on the project: their email or account ' +
		'id, as list_project_people gives it. Leave out when it is your person’s own. A task asked ' +
		'for by anyone but the project’s owner is worked before the owner’s own ideas'
);

export type RequesterChoice = { accountId: string | undefined } | { refusal: string };

/** The person a new task was asked for by, when the writer names one on the project. */
export async function readRequester(
	caller: McpCaller,
	projectId: string,
	input: Record<string, unknown>
): Promise<RequesterChoice> {
	const requestedBy = readOptionalText(input, 'requestedBy');
	if (requestedBy === null) return { accountId: undefined };
	const people = await getProjectPeople(caller.supabase, projectId);
	const person = findProjectPerson(people, requestedBy);
	if (person === null) return { refusal: `${requestedBy} is not on the project. Call list_project_people.` };
	return { accountId: person.id };
}
