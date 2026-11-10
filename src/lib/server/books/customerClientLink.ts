import type { SupabaseClient } from '@supabase/supabase-js';
import { clientLinkPlaceRefusal, type ClientLinkPlace } from '$lib/data/books/clientRegisterLink';
import { validateRecordId } from '$lib/data/isUuid';
import { getClient } from '$lib/server/clients/getClient';
import { BooksRefusal, refuseWhen } from './booksRefusal';

/** The register client a customer is to point at, or null to point at none; refused unless these are Your Business Today's own books and its staff ask. */
export async function resolveClientLink(supabase: SupabaseClient, place: ClientLinkPlace, clientId: unknown): Promise<string | null> {
	if (clientId === null) return null;
	const writtenClientId = typeof clientId === 'string' ? clientId : JSON.stringify(clientId);
	refuseWhen(validateRecordId('client', writtenClientId));
	refuseWhen(clientLinkPlaceRefusal(place));
	const client = await getClient(supabase, writtenClientId);
	if (client === null) throw new BooksRefusal(`No client ${writtenClientId} is on the clients register; list_clients lists them.`);
	return client.id;
}
