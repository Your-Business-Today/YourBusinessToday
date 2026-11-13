import { accountNameLookup } from '$lib/data/accountNames';
import { addConversationParticipant } from '$lib/server/conversations/addConversationParticipant';
import { getConversationParticipantIds } from '$lib/server/conversations/getConversationParticipantIds';
import { getPeopleOnProject } from '$lib/server/members/getPeopleOnProject';
import { isGoalSubject } from '$lib/server/conversations/conversationSubject';
import { noSuchSubject, resolveSubject, type ResolvedSubject } from './resolveSubject';
import { objectSchema, readText, textField } from '../actionTypes';
import { removeConversationParticipant } from '$lib/server/conversations/removeConversationParticipant';
import type { McpAction } from '../actionTypes';
import type { McpCaller } from '../resolveMcpCaller';
import type { ProjectPerson } from '$lib/server/members/projectPersonRecord';

const participantFields = {
	goalId: textField('The goal whose conversation it is — give this or taskId'),
	taskId: textField('The task whose conversation it is — give this or goalId'),
	accountId: textField('Their account id, as list_project_people gives it')
};
const notOnTheProject = 'Nobody on the project has that accountId. Call list_project_people to see who is on it.';
const notOnTheConversation = 'Nobody with that accountId is on the conversation: it holds whoever posted on it or was added to it.';
const nobodyOnIt = 'Nobody is on it now.';

export const conversationParticipantActions: McpAction[] = [
	{
		name: 'add_conversation_participant',
		area: 'conversations',
		audience: 'everyone',
		isWrite: true,
		summary: "add someone on the project to a goal's or a task's conversation, so they are told of what is said on it",
		guidance: 'Posting on a conversation joins you to it by itself; adding is for someone who should follow it without having posted.',
		inputSchema: objectSchema(participantFields, ['accountId']),
		run: async (caller, input) => addParticipant(caller, input)
	},
	{
		name: 'remove_conversation_participant',
		area: 'conversations',
		audience: 'everyone',
		isWrite: true,
		summary: "take someone off a goal's or a task's conversation, so they are no longer told of it",
		inputSchema: objectSchema(participantFields, ['accountId']),
		run: async (caller, input) => removeParticipant(caller, input)
	}
];

async function addParticipant(caller: McpCaller, input: Record<string, unknown>): Promise<string> {
	const found = await resolveSubject(caller, input);
	if (found === null) return noSuchSubject;
	const people = await getPeopleOnProject(caller.supabase, found.projectId);
	const accountId = readText(input, 'accountId');
	const person = people.find((candidate) => candidate.id === accountId);
	if (person === undefined) return notOnTheProject;
	await addConversationParticipant(caller.supabase, found.subject, person.id);
	const onIt = await describeParticipants(caller, found, people);
	return `${person.name} is on the conversation of ${describeSubject(found)}. ${onIt}`;
}

async function removeParticipant(caller: McpCaller, input: Record<string, unknown>): Promise<string> {
	const found = await resolveSubject(caller, input);
	if (found === null) return noSuchSubject;
	const accountId = readText(input, 'accountId');
	const participantIds = await getConversationParticipantIds(caller.supabase, found.subject);
	if (!participantIds.includes(accountId)) return notOnTheConversation;
	await removeConversationParticipant(caller.supabase, found.subject, accountId);
	const people = await getPeopleOnProject(caller.supabase, found.projectId);
	const nameOf = accountNameLookup(people);
	const onIt = await describeParticipants(caller, found, people);
	return `${nameOf(accountId)} is off the conversation of ${describeSubject(found)}. ${onIt}`;
}

async function describeParticipants(caller: McpCaller, found: ResolvedSubject, people: ProjectPerson[]): Promise<string> {
	const participantIds = await getConversationParticipantIds(caller.supabase, found.subject);
	if (participantIds.length === 0) return nobodyOnIt;
	const nameOf = accountNameLookup(people);
	return `On it now: ${participantIds.map(nameOf).join(', ')}.`;
}

function describeSubject(found: ResolvedSubject): string {
	const kind = isGoalSubject(found.subject) ? 'goal' : 'task';
	return `the ${kind} “${found.title}”`;
}
