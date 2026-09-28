import { postedViaChannels } from '$lib/data/conversationTurn';
import { fail } from '@sveltejs/kit';
import { getProjectPeople } from '$lib/server/members/getProjectPeople';
import { messageFormRefusal, readMessageForm } from './readMessageForm';
import { postMessage } from './postMessage';
import type { ConversationSubject } from './conversationSubject';
import type { SupabaseClient } from '@supabase/supabase-js';

export const handOffRefusal = 'The person who answers next must be on the project.';

/** A message typed on the site, handing the baton to someone on the project or to nobody. */
export async function postMessageFromForm(
	supabase: SupabaseClient,
	projectId: string,
	subject: ConversationSubject,
	authorAccountId: string,
	formData: FormData
) {
	const submission = readMessageForm(formData);
	if (submission === null) return fail(400, { message: messageFormRefusal });
	const awaiting = submission.awaiting;
	if (awaiting !== null) {
		const people = await getProjectPeople(supabase, projectId);
		const isOnProject = people.some((person) => person.id === awaiting.accountId);
		if (!isOnProject) return fail(400, { message: handOffRefusal });
	}
	const origin = { postedVia: postedViaChannels.site, awaiting };
	await postMessage(supabase, subject, authorAccountId, submission.body, origin);
	return {};
}
