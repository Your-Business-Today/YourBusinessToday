import { fail } from '@sveltejs/kit';
import { addConversationParticipant } from './addConversationParticipant';
import { getPeopleOnProject } from '$lib/server/members/getPeopleOnProject';
import { removeConversationParticipant } from './removeConversationParticipant';
import type { ConversationSubject } from './conversationSubject';
import type { SupabaseClient } from '@supabase/supabase-js';

export const participantRefusal = 'Pick someone on the project.';

export async function addParticipantFromForm(
	supabase: SupabaseClient,
	projectId: string,
	subject: ConversationSubject,
	formData: FormData
) {
	const accountId = await accountOnProject(supabase, projectId, formData);
	if (accountId === null) return fail(400, { message: participantRefusal });
	await addConversationParticipant(supabase, subject, accountId);
	return {};
}

export async function removeParticipantFromForm(
	supabase: SupabaseClient,
	subject: ConversationSubject,
	formData: FormData
) {
	const accountId = String(formData.get('accountId') ?? '');
	if (accountId === '') return fail(400, { message: participantRefusal });
	await removeConversationParticipant(supabase, subject, accountId);
	return {};
}

async function accountOnProject(
	supabase: SupabaseClient,
	projectId: string,
	formData: FormData
): Promise<string | null> {
	const accountId = String(formData.get('accountId') ?? '');
	const people = await getPeopleOnProject(supabase, projectId);
	if (!people.some((person) => person.id === accountId)) return null;
	return accountId;
}
