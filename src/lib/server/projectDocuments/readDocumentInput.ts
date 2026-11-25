import type { SupabaseClient } from '@supabase/supabase-js';
import { getAccountsById } from '$lib/server/accounts/getAccountsById';
import { readInputRequestsOn } from './documentInputRequests';
import type { ShownInputRequest } from '$lib/projectDocuments/documentInputRequest';

const someoneGone = 'Someone no longer here';

/** The input asked on a document, the oldest first, with the names of the people in it. */
export async function readDocumentInput(supabase: SupabaseClient, documentId: string): Promise<ShownInputRequest[]> {
	const requests = await readInputRequestsOn(supabase, documentId);
	const people = await getAccountsById(supabase, requests.flatMap((request) => [request.askedOf, request.askedBy ?? request.askedOf]));
	const nameOf = (accountId: string | null) => people.find((person) => person.id === accountId)?.name ?? someoneGone;
	return requests.map((request) => ({ ...request, askedByName: nameOf(request.askedBy), askedOfName: nameOf(request.askedOf) }));
}
