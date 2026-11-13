import { fail, isActionFailure, type ActionFailure } from '@sveltejs/kit';
import { deleteClientRecord } from './deleteClientRecord';
import { getClient } from './getClient';
import { supabaseServiceClient } from '$lib/server/payments/supabaseServiceClient';
import { validateRecordId } from '$lib/data/isUuid';
import type { Client } from './clientRecord';
import type { SupabaseClient } from '@supabase/supabase-js';

type DeletionRefusal = ActionFailure<{ message: string }>;

/** Deletes the client a form names and answers it, or answers the failure to show when the id is wrong, the client is gone, or it must stay. */
export async function deleteClientWithId(
	supabase: SupabaseClient,
	clientId: string,
	actorAccountId: string
): Promise<Client | DeletionRefusal> {
	const idRefusal = validateRecordId('client', clientId);
	if (idRefusal !== null) return fail(400, { message: idRefusal });
	const client = await getClient(supabase, clientId);
	if (client === null) return fail(404, { message: 'That client could not be found.' });
	const refusal = await deleteClientRecord(supabaseServiceClient(), client, actorAccountId);
	if (refusal !== null) return fail(409, { message: refusal });
	return client;
}

export function isDeletionRefused(answer: Client | DeletionRefusal): answer is DeletionRefusal {
	return isActionFailure(answer);
}
